# backend/app/services/disease_service.py
import logging
from typing import Optional, Dict, Any
from app.services.llm_client import llm_client

logger = logging.getLogger(__name__)

class DiseaseService:
    def __init__(self, prisma_client):
        self.prisma = prisma_client

    async def get_or_generate_explanation(self, disease_name: str) -> Optional[Dict[str, Any]]:
        """Get disease explanation from DB, or generate via LLM if missing."""
        
        # 1. Check database
        db_disease = await self.prisma.disease.find_unique(
            where={"name": disease_name}
        )
        
        # 2. If found and has content, return it
        if db_disease and db_disease.description and db_disease.treatment:
            return {
                "name": db_disease.name,
                "description": db_disease.description,
                "treatment": db_disease.treatment,
                "symptoms": db_disease.symptoms or [],
                "specialist": db_disease.specialist,
                "category": db_disease.category,
            }
        
        # 3. Not in DB or incomplete → generate via LLM
        try:
            logger.info(f"Generating explanation for disease: {disease_name}")
            explanation = llm_client.generate_disease_explanation(disease_name)
            
            # 4. Save to DB
            if db_disease:
                # Update existing
                updated = await self.prisma.disease.update(
                    where={"name": disease_name},
                    data={
                        "description": explanation.get("description"),
                        "treatment": explanation.get("treatment"),
                        "symptoms": explanation.get("symptoms", []),
                        "specialist": explanation.get("specialist"),
                    }
                )
            else:
                # Create new (shouldn't happen, but fallback)
                updated = await self.prisma.disease.create(
                    data={
                        "name": disease_name,
                        "description": explanation.get("description"),
                        "treatment": explanation.get("treatment"),
                        "symptoms": explanation.get("symptoms", []),
                        "specialist": explanation.get("specialist"),
                    }
                )
            
            return {
                "name": updated.name,
                "description": updated.description,
                "treatment": updated.treatment,
                "symptoms": updated.symptoms or [],
                "specialist": updated.specialist,
            }
            
        except Exception as e:
            logger.error(f"Failed to generate explanation for {disease_name}: {e}")
            return None