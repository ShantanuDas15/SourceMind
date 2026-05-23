from langgraph.graph import StateGraph, END
from app.agents.state import AgentState
from app.agents.nodes.retrieve import retrieve_node
from app.agents.nodes.synthesize import synthesize_node
from loguru import logger

# Build the agent graph: retrieve -> synthesize -> END
workflow = StateGraph(AgentState)

workflow.add_node("retrieve", retrieve_node)
workflow.add_node("synthesize", synthesize_node)

workflow.set_entry_point("retrieve")
workflow.add_edge("retrieve", "synthesize")
workflow.add_edge("synthesize", END)

compiled_graph = workflow.compile()

logger.info("LangGraph agent compiled: retrieve -> synthesize -> END")
