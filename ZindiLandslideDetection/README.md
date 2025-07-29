# Landslide Detection Challenge

This repository contains a machine learning solution for the Zindi Landslide Detection Challenge. The project uses multi-band satellite imagery to classify whether an image contains a landslide or not.

## Project Overview

The challenge involves analyzing 12-band satellite imagery data:
- **Bands 1-4**: Visible and Near Infrared (Red, Green, Blue, NIR)
- **Bands 5-8**: Descending radar bands (VV, VH, Diff VV, Diff VH)
- **Bands 9-12**: Ascending radar bands (VV, VH, Diff VV, Diff VH)

## Dataset Structure

- `Train.csv`: Contains image IDs and binary labels (0 = no landslide, 1 = landslide)
- `Test.csv`: Contains image IDs for prediction
- `train_data/`: Folder containing `.npy` files for training images
- `test_data/`: Folder containing `.npy` files for test images

## Model Architecture

The solution uses a Convolutional Neural Network (CNN) with:
- Multiple convolutional blocks with batch normalization
- Dropout layers for regularization
- Focal Loss to handle class imbalance
- Custom metrics (Precision, Recall, F1-Score)

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd ZindiLandslideDetection
   ```

2. **Create a virtual environment**:
   ```bash
   python -m venv landslide_env
   source landslide_env/bin/activate  # On Windows: landslide_env\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Download the dataset**:
   - Extract the data files to the appropriate directories
   - Ensure `train_data/` and `test_data/` folders contain the `.npy` files
   - Place `Train.csv` and `Test.csv` in the root directory

## Usage

1. **Run the Jupyter notebook**:
   ```bash
   jupyter notebook Starter_Notebook_Landslide_Detection_Challenge.ipynb
   ```

2. **Follow the notebook sections**:
   - Data loading and exploration
   - Model training with data augmentation
   - Evaluation and prediction generation

## Key Features

- **Data Augmentation**: Rotation, shifting, zooming, and flipping to improve model generalization
- **Focal Loss**: Handles class imbalance in the dataset
- **Stratified Sampling**: Maintains class distribution in train/validation splits
- **Model Checkpointing**: Saves the best model based on validation loss

## File Structure

```
ZindiLandslideDetection/
├── Starter_Notebook_Landslide_Detection_Challenge.ipynb
├── requirements.txt
├── README.md
├── .gitignore
├── Train.csv
├── Test.csv
├── train_data/          # .npy files for training
└── test_data/           # .npy files for testing
```

## Dependencies

- TensorFlow 2.x
- NumPy
- Pandas
- Matplotlib
- Scikit-learn
- Jupyter

## License

This project is for educational and research purposes.

## Contributing

Feel free to submit issues and enhancement requests! 