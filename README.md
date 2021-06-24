# rest-api-google-sheets

## bot builder
- [Integration Guide](./guide.md)
- [Google Action Script](./google-action-script.md)

## Create google cloud platform project
- enable billing: cloud run 서비스 사용을 위해서는 반드시 billing 정보 연동 필요
- created project name: rest-api-google-sheets 

## Install gcloud
- installation guide: https://cloud.google.com/sdk/docs/downloads-interactive
```bash
# initialize gcloud
gcloud init 

# set account
gcloud config set account '{gcloud account}'

# set project
gcloud config set project '{project id}'
```

- created project name: `rest-api-google-sheets`
- created project id: `fluent-protocol-292605`

## Download Credentials
```bash
# Get the current project
PROJECT=$(gcloud config get-value core/project 2> /dev/null)

# Create a service account (aka robot account)
gcloud iam service-accounts create sa-name \
  --description="sa-description" \
  --display-name="sa-display-name"

# Create and download credentials for the service account
gcloud iam service-accounts keys create creds.json \
  --iam-account sa-name@$PROJECT.iam.gserviceaccount.com

# Copy service account email
echo "sa-name@$PROJECT.iam.gserviceaccount.com" | pbcopy
```

- created credential id: `sa-name@fluent-protocol-292605.iam.gserviceaccount.com`

## Enable the Google Sheets API
```bash
gcloud services enable sheets.googleapis.com
```

## Deploy
- run `deploy.sh`
```bash
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
```

## Development
- install packages
```bash
npm install
```
- run local
```bash
npm run dev
```
- deploy
```bash
./deploy.sh
```


