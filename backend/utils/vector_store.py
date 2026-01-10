"""
Vector Store for Document Chunks
Uses ChromaDB for semantic search on PDF, DOCX, PPT content
Implements 512-token chunking with overlap for better context retrieval
"""

import os
import logging
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions
import tiktoken

logger = logging.getLogger(__name__)


class VectorStore:
    """
    Manages document embeddings and semantic search
    - Stores document chunks with metadata
    - Enables semantic search for relevant context
    - Supports multiple conversations and files
    """
    
    def __init__(self, persist_directory: str = "./chroma_db"):
        """
        Initialize ChromaDB with sentence-transformers embeddings
        """
        self.persist_directory = persist_directory
        
        try:
            # Create persist directory if it doesn't exist
            os.makedirs(persist_directory, exist_ok=True)
            
            # Initialize ChromaDB client with persistent storage
            self.client = chromadb.PersistentClient(
                path=persist_directory,
                settings=Settings(
                    anonymized_telemetry=False,
                    allow_reset=True
                )
            )
            
            # Use sentence-transformers for embeddings (all-MiniLM-L6-v2)
            self.embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
                model_name="all-MiniLM-L6-v2"
            )
            
            # Get or create collection
            self.collection = self.client.get_or_create_collection(
                name="document_chunks",
                embedding_function=self.embedding_function,
                metadata={"description": "Document chunks for semantic search"}
            )
            
            # Initialize tokenizer for chunking
            self.tokenizer = tiktoken.get_encoding("cl100k_base")
            
            logger.info(f"✅ VectorStore initialized with {self.collection.count()} existing chunks")
            
        except Exception as e:
            logger.error(f"Failed to initialize VectorStore: {e}")
            raise
    
    def chunk_text(self, text: str, chunk_size: int = 512, overlap: int = 50) -> List[str]:
        """
        Split text into overlapping chunks based on token count
        
        Args:
            text: Input text to chunk
            chunk_size: Maximum tokens per chunk (default: 512)
            overlap: Number of overlapping tokens between chunks (default: 50)
        
        Returns:
            List of text chunks
        """
        try:
            # Tokenize the entire text
            tokens = self.tokenizer.encode(text)
            
            chunks = []
            start = 0
            
            while start < len(tokens):
                # Get chunk of tokens
                end = min(start + chunk_size, len(tokens))
                chunk_tokens = tokens[start:end]
                
                # Decode back to text
                chunk_text = self.tokenizer.decode(chunk_tokens)
                chunks.append(chunk_text)
                
                # Move start position (with overlap)
                start = end - overlap
                
                # Break if we've reached the end
                if end >= len(tokens):
                    break
            
            logger.info(f"📄 Created {len(chunks)} chunks from text (tokens: {len(tokens)})")
            return chunks
            
        except Exception as e:
            logger.error(f"Error chunking text: {e}")
            return [text]  # Return original text as fallback
    
    def add_document(
        self,
        conversation_id: int,
        file_name: str,
        text_content: str,
        file_type: str = "pdf"
    ) -> int:
        """
        Add document to vector store with chunking
        
        Args:
            conversation_id: ID of the conversation
            file_name: Name of the uploaded file
            text_content: Extracted text from document
            file_type: Type of file (pdf, docx, ppt)
        
        Returns:
            Number of chunks added
        """
        try:
            # Create chunks
            chunks = self.chunk_text(text_content)
            
            if not chunks:
                logger.warning(f"No chunks created for file: {file_name}")
                return 0
            
            # Prepare data for ChromaDB
            ids = [f"conv_{conversation_id}_file_{file_name}_chunk_{i}" for i in range(len(chunks))]
            
            metadatas = [
                {
                    "conversation_id": conversation_id,
                    "file_name": file_name,
                    "file_type": file_type,
                    "chunk_index": i,
                    "total_chunks": len(chunks)
                }
                for i in range(len(chunks))
            ]
            
            # Add to collection
            self.collection.add(
                documents=chunks,
                metadatas=metadatas,
                ids=ids
            )
            
            logger.info(f"✅ Added {len(chunks)} chunks from {file_name} to conversation {conversation_id}")
            return len(chunks)
            
        except Exception as e:
            logger.error(f"Error adding document to vector store: {e}")
            return 0
    
    def search(
        self,
        conversation_id: int,
        query: str,
        n_results: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Search for relevant document chunks using semantic similarity
        
        Args:
            conversation_id: ID of the conversation
            query: User's question/query
            n_results: Number of results to return (default: 5)
        
        Returns:
            List of relevant chunks with metadata and scores
        """
        try:
            # Query the collection with conversation filter
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results,
                where={"conversation_id": conversation_id}
            )
            
            # Format results
            formatted_results = []
            
            if results and results["documents"] and results["documents"][0]:
                for i, doc in enumerate(results["documents"][0]):
                    formatted_results.append({
                        "content": doc,
                        "metadata": results["metadatas"][0][i] if results["metadatas"] else {},
                        "distance": results["distances"][0][i] if results["distances"] else None,
                        "id": results["ids"][0][i] if results["ids"] else None
                    })
                
                logger.info(f"🔍 Found {len(formatted_results)} relevant chunks for query in conversation {conversation_id}")
            else:
                logger.info(f"🔍 No chunks found for conversation {conversation_id}")
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error searching vector store: {e}")
            return []
    
    def has_documents(self, conversation_id: int) -> bool:
        """
        Check if conversation has any uploaded documents
        """
        try:
            results = self.collection.get(
                where={"conversation_id": conversation_id},
                limit=1
            )
            return len(results["ids"]) > 0
        except Exception as e:
            logger.error(f"Error checking documents: {e}")
            return False
    
    def delete_conversation_documents(self, conversation_id: int) -> int:
        """
        Delete all document chunks for a specific conversation
        
        Returns:
            Number of chunks deleted
        """
        try:
            # Get all IDs for this conversation
            results = self.collection.get(
                where={"conversation_id": conversation_id}
            )
            
            if results and results["ids"]:
                self.collection.delete(ids=results["ids"])
                deleted_count = len(results["ids"])
                logger.info(f"🗑️ Deleted {deleted_count} chunks for conversation {conversation_id}")
                return deleted_count
            
            return 0
            
        except Exception as e:
            logger.error(f"Error deleting conversation documents: {e}")
            return 0
    
    def get_context_for_query(
        self,
        conversation_id: int,
        query: str,
        max_tokens: int = 2000
    ) -> str:
        """
        Get relevant context from documents for answering a query
        Combines top chunks into a single context string within token limit
        
        Args:
            conversation_id: ID of the conversation
            query: User's question
            max_tokens: Maximum tokens for combined context
        
        Returns:
            Combined context string from relevant chunks
        """
        try:
            # Search for relevant chunks
            results = self.search(conversation_id, query, n_results=10)
            
            if not results:
                return ""
            
            # Combine chunks until we hit token limit
            context_parts = []
            total_tokens = 0
            
            for result in results:
                chunk_text = result["content"]
                chunk_tokens = len(self.tokenizer.encode(chunk_text))
                
                if total_tokens + chunk_tokens <= max_tokens:
                    context_parts.append(chunk_text)
                    total_tokens += chunk_tokens
                else:
                    break
            
            context = "\n\n---\n\n".join(context_parts)
            logger.info(f"📑 Compiled context: {len(context_parts)} chunks, ~{total_tokens} tokens")
            
            return context
            
        except Exception as e:
            logger.error(f"Error getting context: {e}")
            return ""
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get vector store statistics
        """
        try:
            total_chunks = self.collection.count()
            
            # Get unique conversations (this is expensive, so we limit it)
            all_metadata = self.collection.get(limit=1000)
            
            unique_conversations = set()
            if all_metadata and all_metadata["metadatas"]:
                unique_conversations = {m.get("conversation_id") for m in all_metadata["metadatas"]}
            
            return {
                "total_chunks": total_chunks,
                "unique_conversations": len(unique_conversations),
                "collection_name": self.collection.name,
                "persist_directory": self.persist_directory
            }
        except Exception as e:
            logger.error(f"Error getting stats: {e}")
            return {"error": str(e)}


# Global vector store instance - will be initialized lazily on first use
vector_store = None


def get_vector_store():
    """
    Get or create the global vector store instance (lazy initialization)
    """
    global vector_store
    if vector_store is None:
        vector_store = VectorStore()
    return vector_store
