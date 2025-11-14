import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from scipy.stats import gaussian_kde
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# Configuration
INPUT_FILE = 'dataset.csv'
OUTPUT_FILE = 'augmented_dataset.csv'
AUGMENTATION_FACTOR = 3
NO_MIGRAINE_RATIO = 0.25  # 25% of final dataset will be "No migraine"
RANDOM_SEED = 42

np.random.seed(RANDOM_SEED)

def load_data(filepath):
    """Load CSV data"""
    print(f"Loading data from {filepath}...")
    df = pd.read_csv(filepath)
    print(f"Loaded {len(df)} records with {len(df.columns)} columns")
    return df

def analyze_dataset(df):
    """Calculate and display statistical details"""
    print("\n" + "="*60)
    print("DATASET STATISTICAL ANALYSIS")
    print("="*60)
    
    print(f"\nDataset Shape: {df.shape}")
    print(f"\nData Types:\n{df.dtypes}")
    
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
    
    print(f"\nNumeric Columns ({len(numeric_cols)}): {numeric_cols}")
    print(f"Categorical Columns ({len(categorical_cols)}): {categorical_cols}")
    
    print("\nNumeric Column Statistics:")
    print(df[numeric_cols].describe().round(2))
    
    if 'Type' in df.columns:
        print("\nMigraine Type Distribution:")
        print(df['Type'].value_counts())
        print("\nMigraine Type Proportions:")
        print(df['Type'].value_counts(normalize=True).round(3))
    
    missing = df.isnull().sum()
    print("\nMissing Values:")
    print(missing[missing > 0] if missing.sum() > 0 else "No missing values")
    
    return numeric_cols, categorical_cols

def augment_with_gaussian(df, numeric_cols, augmentation_factor=3):
    """Augment dataset using Gaussian noise"""
    print(f"\n" + "="*60)
    print("GAUSSIAN NOISE AUGMENTATION")
    print("="*60)
    
    augmented_records = []
    numeric_data = df[numeric_cols].copy()
    
    print(f"\nAugmenting dataset by factor of {augmentation_factor}...")
    
    for idx, row in df.iterrows():
        augmented_records.append(row.copy())
        
        for _ in range(augmentation_factor - 1):
            new_row = row.copy()
            
            for col in numeric_cols:
                value = row[col]
                std_dev = numeric_data[col].std()
                noise_std = std_dev * 0.1
                
                gaussian_noise = np.random.normal(0, noise_std)
                new_value = max(0, value + gaussian_noise)
                
                if isinstance(value, (int, np.integer)) or value == int(value):
                    new_value = int(round(new_value))
                
                new_row[col] = new_value
            
            augmented_records.append(new_row)
    
    augmented_df = pd.DataFrame(augmented_records)
    print(f"Original dataset size: {len(df)}")
    print(f"Gaussian augmented size: {len(augmented_df)}")
    
    return augmented_df

def apply_kde_augmentation(df, numeric_cols, n_new_samples=100):
    """Apply augmentation with smart handling of binary and continuous features"""
    print(f"\nApplying smart augmentation ({n_new_samples} new samples)...")

    # Separate binary and continuous features
    binary_cols = []
    continuous_cols = []

    for col in numeric_cols:
        unique_vals = df[col].nunique()
        if unique_vals <= 2:  # Binary feature
            binary_cols.append(col)
        else:
            continuous_cols.append(col)

    print(f"  Binary features: {len(binary_cols)}")
    print(f"  Continuous features: {len(continuous_cols)}")

    synthetic_df = pd.DataFrame()

    # Handle continuous features with KDE if we have enough
    if len(continuous_cols) > 0:
        try:
            continuous_data = df[continuous_cols].copy()
            scaler = StandardScaler()
            scaled_data = scaler.fit_transform(continuous_data)

            # Add small regularization to avoid singular matrix
            scaled_data_reg = scaled_data + np.random.normal(0, 1e-6, scaled_data.shape)

            kde = gaussian_kde(scaled_data_reg.T, bw_method='scott')
            synthetic_scaled = kde.resample(n_new_samples)
            synthetic_continuous = scaler.inverse_transform(synthetic_scaled.T)

            for idx, col in enumerate(continuous_cols):
                synthetic_df[col] = synthetic_continuous[:, idx]
                # Round integer columns and clip to valid ranges
                if df[col].dtype == 'int64':
                    min_val = df[col].min()
                    max_val = df[col].max()
                    synthetic_df[col] = synthetic_df[col].round().astype(int).clip(min_val, max_val)

            print(f"  ✓ KDE applied to continuous features")
        except Exception as e:
            print(f"  Warning: KDE failed, using sampling for continuous features: {e}")
            for col in continuous_cols:
                synthetic_df[col] = np.random.choice(df[col].values, size=n_new_samples)

    # Handle binary features with probability-based sampling
    for col in binary_cols:
        prob_1 = df[col].mean()  # Probability of value being 1
        synthetic_df[col] = np.random.binomial(1, prob_1, size=n_new_samples)

    # Handle categorical columns
    categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
    for col in categorical_cols:
        # Sample based on original distribution
        synthetic_df[col] = np.random.choice(df[col].values, size=n_new_samples)

    # Reorder columns to match original
    synthetic_df = synthetic_df[df.columns]

    print(f"  ✓ Generated {len(synthetic_df)} synthetic samples")

    return synthetic_df

def generate_no_migraine_samples(n_samples, reference_df):
    """Generate synthetic 'No migraine' samples for classification"""
    print(f"\nGenerating {n_samples} 'No migraine' samples...")

    no_migraine_data = []

    # Symptom columns that should mostly be 0 for non-migraine cases
    symptom_cols = ['Nausea', 'Vomit', 'Phonophobia', 'Photophobia', 'Visual',
                    'Sensory', 'Dysphasia', 'Dysarthria', 'Vertigo', 'Tinnitus',
                    'Hypoacusis', 'Diplopia', 'Defect', 'Ataxia', 'Conscience', 'Paresthesia']

    for _ in range(n_samples):
        sample = {}

        # Age: similar distribution to migraine patients
        sample['Age'] = int(np.random.normal(reference_df['Age'].mean(),
                                             reference_df['Age'].std()))
        sample['Age'] = np.clip(sample['Age'], 18, 75)  # Reasonable age range

        # Duration: 0 or very low (no prolonged headache episodes)
        sample['Duration'] = np.random.choice([0, 1], p=[0.7, 0.3])

        # Frequency: 0 or very low (infrequent or no headaches)
        sample['Frequency'] = np.random.choice([0, 1], p=[0.8, 0.2])

        # Location, Character: 0 or low (no specific migraine location/character)
        sample['Location'] = np.random.choice([0, 1], p=[0.7, 0.3])
        sample['Character'] = np.random.choice([0, 1], p=[0.7, 0.3])

        # Intensity: 0-1 (no severe pain)
        sample['Intensity'] = np.random.choice([0, 1], p=[0.8, 0.2])

        # Symptoms: mostly 0s, occasional 1s (not full migraine pattern)
        # Only 0-2 symptoms present, not the typical migraine cluster
        n_symptoms_present = np.random.choice([0, 1, 2], p=[0.6, 0.3, 0.1])

        for symptom in symptom_cols:
            sample[symptom] = 0

        if n_symptoms_present > 0:
            # Randomly select which symptoms to activate
            symptoms_to_activate = np.random.choice(symptom_cols,
                                                    size=n_symptoms_present,
                                                    replace=False)
            for symptom in symptoms_to_activate:
                sample[symptom] = 1

        # DPF: mostly 0 (no family history)
        sample['DPF'] = np.random.choice([0, 1], p=[0.9, 0.1])

        # Type: No migraine
        sample['Type'] = 'No migraine'

        no_migraine_data.append(sample)

    no_migraine_df = pd.DataFrame(no_migraine_data)

    # Ensure column order matches original dataset
    no_migraine_df = no_migraine_df[reference_df.columns]

    print(f"  ✓ Generated {len(no_migraine_df)} 'No migraine' samples")
    print(f"  Average symptoms per sample: {no_migraine_df[symptom_cols].sum(axis=1).mean():.2f}")

    return no_migraine_df

def save_augmented_data(original_df, gaussian_aug_df, kde_aug_df, no_migraine_df, output_file):
    """Combine and save augmented data"""
    print(f"\n" + "="*60)
    print("SAVING RESULTS")
    print("="*60)

    combined_df = pd.concat([original_df, gaussian_aug_df, kde_aug_df, no_migraine_df],
                            ignore_index=True)

    # Shuffle the dataset
    combined_df = combined_df.sample(frac=1, random_state=RANDOM_SEED).reset_index(drop=True)

    combined_df.to_csv(output_file, index=False)
    print(f"\n✓ Augmented dataset saved to: {output_file}")
    print(f"  Original migraine samples: {len(original_df)}")
    print(f"  Augmented migraine samples: {len(original_df) + len(gaussian_aug_df) + len(kde_aug_df)}")
    print(f"  No migraine samples: {len(no_migraine_df)}")
    print(f"  Final size: {len(combined_df)}")
    print(f"  Augmentation factor: {len(combined_df) / len(original_df):.2f}x")

    print(f"\n✓ Class distribution:")
    print(combined_df['Type'].value_counts().sort_values(ascending=False))
    print(f"\n✓ Class proportions:")
    print(combined_df['Type'].value_counts(normalize=True).sort_values(ascending=False).round(3))

    return combined_df

def create_visualizations(original_df, augmented_df, numeric_cols):
    """Create comparison visualizations"""
    print("\nGenerating visualizations...")

    output_dir = Path('visualizations')
    output_dir.mkdir(exist_ok=True, parents=True)
    
    plot_cols = [col for col in numeric_cols if col in 
                 ['Age', 'Duration', 'Frequency', 'Intensity']][:3]
    
    if plot_cols:
        fig, axes = plt.subplots(len(plot_cols), 2, figsize=(12, 10))
        
        for idx, col in enumerate(plot_cols):
            axes[idx, 0].hist(original_df[col], bins=30, alpha=0.7, color='blue', edgecolor='black')
            axes[idx, 0].set_title(f'Original - {col}')
            axes[idx, 0].set_ylabel('Frequency')
            
            axes[idx, 1].hist(augmented_df[col], bins=30, alpha=0.7, color='green', edgecolor='black')
            axes[idx, 1].set_title(f'Augmented - {col}')
            axes[idx, 1].set_ylabel('Frequency')
        
        plt.tight_layout()
        viz_path = output_dir / 'distribution_comparison.png'
        plt.savefig(viz_path, dpi=300, bbox_inches='tight')
        print(f"✓ Visualization saved to: {viz_path}")
        plt.close()

def generate_report(original_df, augmented_df, numeric_cols):
    """Generate summary report"""
    print(f"\n" + "="*60)
    print("AUGMENTATION REPORT")
    print("="*60)
    
    print(f"\nOriginal Dataset:")
    print(f"  Records: {len(original_df)}")
    print(f"  Features: {len(original_df.columns)}")
    
    print(f"\nAugmented Dataset:")
    print(f"  Records: {len(augmented_df)}")
    print(f"  Features: {len(augmented_df.columns)}")
    print(f"  Augmentation Factor: {len(augmented_df) / len(original_df):.2f}x")
    
    print(f"\nNumeric Columns Mean Comparison:")
    for col in numeric_cols:
        orig_mean = original_df[col].mean()
        aug_mean = augmented_df[col].mean()
        diff_pct = abs(aug_mean - orig_mean) / orig_mean * 100 if orig_mean != 0 else 0
        print(f"  {col:15} | Orig: {orig_mean:7.2f} | Aug: {aug_mean:7.2f} | Diff: {diff_pct:5.1f}%")

def main():
    """Main execution"""
    print("="*60)
    print("MIGRAINE CLASSIFICATION DATASET AUGMENTATION")
    print("="*60)

    df = load_data(INPUT_FILE)
    numeric_cols, categorical_cols = analyze_dataset(df)

    # Augment migraine samples
    gaussian_aug = augment_with_gaussian(df, numeric_cols, AUGMENTATION_FACTOR)
    kde_aug = apply_kde_augmentation(df, numeric_cols, n_new_samples=len(df))

    # Calculate how many "No migraine" samples needed for desired ratio
    total_migraine_samples = len(df) + len(gaussian_aug) + len(kde_aug)
    # If we want NO_MIGRAINE_RATIO of final dataset to be "No migraine":
    # no_migraine / (total_migraine + no_migraine) = NO_MIGRAINE_RATIO
    # no_migraine = NO_MIGRAINE_RATIO * (total_migraine + no_migraine)
    # no_migraine * (1 - NO_MIGRAINE_RATIO) = NO_MIGRAINE_RATIO * total_migraine
    # no_migraine = (NO_MIGRAINE_RATIO * total_migraine) / (1 - NO_MIGRAINE_RATIO)
    n_no_migraine = int((NO_MIGRAINE_RATIO * total_migraine_samples) / (1 - NO_MIGRAINE_RATIO))

    print(f"\n" + "="*60)
    print("GENERATING NEGATIVE SAMPLES")
    print("="*60)
    print(f"Total migraine samples: {total_migraine_samples}")
    print(f"Target 'No migraine' samples: {n_no_migraine} ({NO_MIGRAINE_RATIO*100:.0f}% of final dataset)")

    no_migraine_samples = generate_no_migraine_samples(n_no_migraine, df)

    final_df = save_augmented_data(df, gaussian_aug, kde_aug, no_migraine_samples, OUTPUT_FILE)

    create_visualizations(df, final_df, numeric_cols)
    generate_report(df, final_df, numeric_cols)

    print("\n" + "="*60)
    print("✓ PIPELINE COMPLETED SUCCESSFULLY")
    print("="*60)
    print(f"\nDataset ready for 8-class classification:")
    print(f"  - 7 migraine types + 'No migraine'")
    print(f"  - Features: All symptoms + demographics")
    print(f"  - Target: Type column")
    print("="*60)

if __name__ == "__main__":
    main()