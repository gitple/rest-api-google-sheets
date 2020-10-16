#!/bin/bash
# deploy.sh
# Deploy to google cloud run

# get project id
GCP_PROJECT=$(gcloud config list --format 'value(core.project)' 2>/dev/null)

# build image
gcloud builds submit \
--tag gcr.io/$GCP_PROJECT/sheets-on-run

# set default region : seoul
gcloud config set run/region asia-northeast3

# deploy image
gcloud run deploy sheets-on-run \
--image gcr.io/$GCP_PROJECT/sheets-on-run \
--platform managed \
--allow-unauthenticated
