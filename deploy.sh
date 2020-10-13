#!/bin/bash
# deploy.sh
# Deploy the image

# Replace this with your Google Project ID
GOOGLE_PROJECT_ID=operating-realm-291905
# Replace this with your desired container image name
CONTAINER_IMAGE_NAME=node-sandwich-bot-rest-api

gcloud run deploy --image gcr.io/$GOOGLE_PROJECT_ID/$CONTAINER_IMAGE_NAME \
  --platform managed
