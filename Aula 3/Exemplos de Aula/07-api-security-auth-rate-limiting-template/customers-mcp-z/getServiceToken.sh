SERVICE_TOKEN=$(
  curl -X POST http://localhost:9999/v1/auth/service-token \
  -H "Content-Type: application/json" \
  -d '{"username": "erickwendel", "password": "123123", "adminSuperSecret": "AM I THE BOSS?"}' \
  | jq -r '.serviceToken')

echo "AdminService Token: $SERVICE_TOKEN"


SERVICE_TOKEN=$(curl --silent -X POST http://localhost:9999/v1/auth/service-token \
  -H "Content-Type: application/json" \
  -d '{"username": "ananeri", "password": "1234", "adminSuperSecret": "AM I THE BOSS?"}' \
  | jq -r '.serviceToken')

echo "Member Service Token: $SERVICE_TOKEN"

curl http://localhost:9999/v1/customers \
  -H "Authorization: Bearer $SERVICE_TOKEN"