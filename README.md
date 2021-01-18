# Billing documents plugin
A billing document is created for a credit memo, debit memo, an invoice or a cancelled transaction. 
Each billing document has a header and list of items under it.

## API
Plugin exposes 4 endpoints to customer credit:
* `GET /vendor/billing-documents/{{customerId}}?token={{token}}&storeCode={{storeCode}}` - returns list of customer billing documents
* `GET /vendor/billing-documents/single/{{entityId}}?token={{token}}&storeCode={{storeCode}}` - returns single billing document
* `GET /vendor/billing-documents/type/{{customerId}}?token={{token}}&storeCode={{storeCode}}` - returns list of document types
* `GET /vendor/billing-documents/type/single/{{typeId}}?token={{token}}&storeCode={{storeCode}}` - returns single document type

## Filtering list
Billing document list list can be filtered and sorted via additional query parameters on 
endpoint `GET /billing-documents/{{customerId}}` and `/billing-documents/type/{{customerId}}`:
* pageSize - `{number}`
* currentPage - `{number}`
* sortBy - field by which list will be sorted
* sortDir - sort direction `{asc|desc}`

## Entry point
Entry point for plugin is a /src/index.js file. It contains a template function
for api plugin.
