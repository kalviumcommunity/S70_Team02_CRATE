import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

class RetentionPredictor:
    """
    Trains a RandomForestClassifier to predict contributor return probability 
    and provides a prediction function.
    """
    def __init__(self):
        self.model = RandomForestClassifier(random_state=42, n_estimators=100)
        self.is_trained = False

    def train(self, df: pd.DataFrame):
        """
        Trains the RandomForest model using the provided DataFrame.
        Expected columns: 'merge_time_hours' (feature) and 'returned' (target).
        """
        if df.empty or len(df) < 2:
            print("[Model] Not enough data to train the model.")
            return

        # Prepare features (X) and target (y)
        X = df[["merge_time_hours"]]
        y = df["returned"]
        
        # Handle case where all targets are the same (e.g., all 1s or all 0s)
        if len(y.unique()) == 1:
            print("[Model] Warning: Only one class present in the dataset. Training will proceed but model may overfit to this class.")
            self.model.fit(X, y)
            self.is_trained = True
            return

        # Split data into training and testing sets
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Train model
        self.model.fit(X_train, y_train)
        self.is_trained = True
        
        # Evaluate model accuracy
        predictions = self.model.predict(X_test)
        accuracy = accuracy_score(y_test, predictions)
        print(f"[Model] Trained successfully. Test Accuracy: {accuracy:.2f}")

    def predict(self, merge_time_hours: float) -> float:
        """
        Predicts the probability of a contributor returning based on their merge time.
        """
        if not self.is_trained:
            print("[Model] Cannot predict. Model is not trained yet.")
            return 0.0
            
        # Format input for prediction
        X_new = pd.DataFrame([{"merge_time_hours": merge_time_hours}])
        
        # predict_proba returns an array of shape (n_samples, n_classes)
        probabilities = self.model.predict_proba(X_new)
        
        # Handle edge case where the model only trained on one class
        if probabilities.shape[1] == 1:
            return float(self.model.classes_[0])
            
        # Return probability of class 1 (returned)
        return float(probabilities[0][1])
