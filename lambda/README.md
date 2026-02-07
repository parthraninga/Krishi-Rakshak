# KrishiRakshak Products API – Lambda (SAM)

This folder is an AWS SAM application that deploys the products API as a Lambda function behind API Gateway. It uses your MongoDB Atlas URI and exposes the same endpoints as the Node server.

## Prerequisites

- [AWS CLI](https://aws.amazon.com/cli/) configured (`aws configure`)
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) installed
- Node.js 20.x (for local `npm install` and `sam build`)

## Endpoints (after deploy)

- `GET /api/products/debug` – DB connection and product count
- `GET /api/products/by-crop-category?cropName=Wheat&uiCategory=seeds`
- `GET /api/products/:productId?enrich=crops`

## Deploy with SAM

1. **Install dependencies**
   ```bash
   cd lambda
   npm install
   ```

2. **Build**
   ```bash
   sam build
   ```

3. **Deploy** (pass your MongoDB URI from project root `.env` line 8–9)
   ```bash
   sam deploy --guided
   ```
   When prompted:
   - **Stack name**: e.g. `krishirakshak-products`
   - **AWS Region**: your choice (e.g. `us-east-1`)
   - **Parameter MongoUri**: paste your full MongoDB URI, e.g.  
     `mongodb+srv://Admin:YOUR_PASSWORD@cluster0.gtlis6r.mongodb.net/krishi-sakhi?retryWrites=true&w=majority&appName=Cluster0`

   Or deploy non-interactively with the URI in one go. **Use single quotes** so the shell does not interpret `?` and `&` in the URI:
   ```bash
   sam deploy --parameter-overrides 'MongoUri=mongodb+srv://Admin:YOUR_PASSWORD@cluster0.gtlis6r.mongodb.net/krishi-sakhi?retryWrites=true&w=majority&appName=Cluster0'
   ```
   If you see "Invalid scheme" or "MONGODB_URI must start with mongodb://", the URI was not passed correctly – redeploy with the full URI in single quotes as above.

4. **Get the API URL**  
   After deploy, note the **ProductsApiUrl** from the stack outputs (or run `aws cloudformation describe-stacks --stack-name krishirakshak-products --query 'Stacks[0].Outputs'`). Use that URL as **API_BASE** in the app’s `src/config.js` (no trailing slash).

## Optional: use a config file for deploy

Create `samconfig.toml` (do not commit if it contains the URI):

```toml
version = 0.1
[default.deploy.parameters]
stack_name = "krishirakshak-products"
region = "us-east-1"
parameter_overrides = "MongoUri=mongodb+srv://..."
capabilities = "CAPABILITY_IAM"
confirm_changeset = true
```

Then run:

```bash
sam deploy
```

## Local invocation (optional)

```bash
sam local invoke ProductsApiFunction -e events/debug.json
```

You can add `events/debug.json` with a sample API Gateway event for `/api/products/debug` if you want to test locally.
