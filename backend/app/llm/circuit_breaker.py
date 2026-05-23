import time
import asyncio
from enum import Enum
from loguru import logger


class CircuitState(Enum):
    CLOSED = "CLOSED"       # Normal operation — requests flow through
    OPEN = "OPEN"           # Failing — requests are rejected immediately
    HALF_OPEN = "HALF_OPEN" # Probing — one request allowed to test recovery


class CircuitBreaker:
    """
    A lightweight circuit breaker for external API calls.

    State Transitions:
        CLOSED  →  (failure_threshold consecutive failures)  →  OPEN
        OPEN    →  (recovery_timeout elapsed)                →  HALF_OPEN
        HALF_OPEN → (success_threshold successes)            →  CLOSED
        HALF_OPEN → (any failure)                            →  OPEN
    """

    def __init__(
        self,
        name: str = "default",
        failure_threshold: int = 5,
        recovery_timeout: int = 30,
        success_threshold: int = 2,
    ):
        self.name = name
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.success_threshold = success_threshold

        self._state = CircuitState.CLOSED
        self._failure_count = 0
        self._success_count = 0
        self._last_failure_time: float = 0.0

    @property
    def state(self) -> CircuitState:
        """Returns current state, auto-transitioning OPEN → HALF_OPEN if timeout has elapsed."""
        if self._state == CircuitState.OPEN:
            if (time.time() - self._last_failure_time) >= self.recovery_timeout:
                self._transition_to(CircuitState.HALF_OPEN)
        return self._state

    def _transition_to(self, new_state: CircuitState):
        old_state = self._state
        self._state = new_state

        if new_state == CircuitState.HALF_OPEN:
            self._success_count = 0

        if new_state == CircuitState.CLOSED:
            self._failure_count = 0
            self._success_count = 0

        logger.warning(
            f"[Circuit Breaker '{self.name}'] {old_state.value} → {new_state.value}"
        )

    def record_success(self):
        """Record a successful call."""
        if self._state == CircuitState.HALF_OPEN:
            self._success_count += 1
            if self._success_count >= self.success_threshold:
                self._transition_to(CircuitState.CLOSED)
        else:
            # Reset failure count on success in CLOSED state
            self._failure_count = 0

    def record_failure(self):
        """Record a failed call."""
        self._failure_count += 1
        self._last_failure_time = time.time()

        if self._state == CircuitState.HALF_OPEN:
            # Any failure in half-open goes back to open
            self._transition_to(CircuitState.OPEN)
        elif self._failure_count >= self.failure_threshold:
            self._transition_to(CircuitState.OPEN)

    @property
    def is_call_permitted(self) -> bool:
        """Check if a call is allowed through the circuit."""
        current = self.state  # triggers auto-transition check
        if current == CircuitState.CLOSED:
            return True
        if current == CircuitState.HALF_OPEN:
            return True  # Allow probe request
        return False  # OPEN — reject


# Module-level singleton for the Groq API circuit breaker
groq_circuit_breaker = CircuitBreaker(
    name="groq_api",
    failure_threshold=5,
    recovery_timeout=30,
    success_threshold=2,
)
