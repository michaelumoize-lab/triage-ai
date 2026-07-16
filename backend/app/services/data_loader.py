# backend/app/services/data_loader.py
import pandas as pd
import numpy as np
from pathlib import Path
from typing import List, Tuple

class DataLoader:
    def __init__(self, data_path: str | None = None):
        if data_path is None:
            self.data_path = Path(__file__).parent.parent.parent / "data" / "symbipredict_2022.csv"
        else:
            self.data_path = Path(data_path)
    
    def load_dataset(self) -> pd.DataFrame:
        """Load the dataset from CSV"""
        if not self.data_path.exists():
            raise FileNotFoundError(f"Dataset not found at {self.data_path}")
        return pd.read_csv(self.data_path)
    
    def get_symptom_columns(self) -> List[str]:
        """Return all symptom column names (exclude 'prognosis')"""
        df = self.load_dataset()
        return [col for col in df.columns if col != "prognosis"]
    
    def get_diseases(self) -> List[str]:
        """Return unique disease labels"""
        df = self.load_dataset()
        return df["prognosis"].unique().tolist()
    
    def prepare_training_data(self) -> Tuple[np.ndarray, np.ndarray]:
        """Return X (features) and y (labels) for training"""
        df = self.load_dataset()
        X = df.drop("prognosis", axis=1).values
        y = df["prognosis"].values
        return X, y