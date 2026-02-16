#!/bin/bash

# Configuración
PROJECT_REF="lkillwfvbblwhtslewsg"
ACCESS_TOKEN="sbp_9487c52b3a6e7f741b840d474d7c3c7cb1f4bd36"

# Leer el script SQL
SQL_SCRIPT=$(cat supabase-schema.sql)

# Ejecutar el script via API de Supabase
curl -X POST "https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$SQL_SCRIPT" | jq -Rs .)}"

echo ""
echo "✅ Base de datos configurada!"
