import cloudinary
import cloudinary.uploader
import os
import sys

# Print env vars (masking secrets)
print("Checking environment variables...")
cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME") or os.getenv("COULDINARY_CLOUD_NAME") or os.getenv("CLOUD_NAME")
api_key = os.getenv("CLOUDINARY_API_KEY") or os.getenv("COULDINARY_API_KEY")
api_secret = os.getenv("CLOUDINARY_API_SECRET") or os.getenv("COULDINARY_API_SECRET")

print(f"Cloud Name: {cloud_name}")
print(f"API Key present: {bool(api_key)}")
print(f"API Secret present: {bool(api_secret)}")

if not cloud_name or not api_key or not api_secret:
    print("ERROR: Missing Cloudinary credentials!")
    sys.exit(1)

# Configure
cloudinary.config(
  cloud_name = cloud_name,
  api_key = api_key,
  api_secret = api_secret
)

# Create dummy image file
with open("test_image.txt", "w") as f:
    f.write("This is a test file to simulate an image upload.")

print("\nAttempting to upload 'test_image.txt' to Cloudinary...")
try:
    # Upload resource_type='raw' for text file, or 'auto'
    response = cloudinary.uploader.upload("test_image.txt", resource_type="auto")
    print("SUCCESS!")
    print(f"Public ID: {response.get('public_id')}")
    print(f"URL: {response.get('secure_url')}")
except Exception as e:
    print(f"\nFAILURE: Upload failed.")
    print(f"Error Type: {type(e).__name__}")
    print(f"Error Message: {str(e)}")
    import traceback
    traceback.print_exc()
