#!/bin/bash
# build.sh
# Build the container 

# Replace this with your Google Project ID
GOOGLE_PROJECT_ID=fluent-protocol-292605
# Replace this with your desired container image name
CONTAINER_IMAGE_NAME=rest-api-google-sheets

gcloud builds submit --tag gcr.io/$GOOGLE_PROJECT_ID/$CONTAINER_IMAGE_NAME \
  --project=$GOOGLE_PROJECT_ID