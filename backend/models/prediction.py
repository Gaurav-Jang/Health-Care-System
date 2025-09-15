class Prediction:
    """
    Dummy class for storing prediction data.
    Replace with real DB logic if needed.
    """
    def __init__(self):
        self.storage = []
        self.counter = 1

    def create_prediction(self, data):
        data['prediction_id'] = self.counter
        self.storage.append(data)
        self.counter += 1
        return data['prediction_id']

    def get_all_predictions(self):
        return self.storage

    def get_predictions_stats(self):
        """
        Returns statistics for admin dashboard
        """
        total = len(self.storage)
        # Example: count predictions by tumor type if 'result' field exists
        benign_count = sum(1 for p in self.storage if p.get('result') == 'benign')
        malignant_count = sum(1 for p in self.storage if p.get('result') == 'malignant')
        return {
            'total_predictions': total,
            'benign_count': benign_count,
            'malignant_count': malignant_count
        }
