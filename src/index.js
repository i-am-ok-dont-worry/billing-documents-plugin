const SearchCriteria = require('magento-searchcriteria-builder');

module.exports = ({ config, db, router, cache, apiStatus, apiError, getRestApiClient }) => {
    const createMage2RestClient = () => {
        const client = getRestApiClient();
        client.addMethods('billingDocuments', (restClient) => {
            const module = {};
            module.getBillingDocuments = ({ customerId, sortBy, sortDir, pageSize, currentPage }, token) => {
                const url = `/kmk-billingdocuments/search`;
                const query = new SearchCriteria();
                query.applyFilter('customer_id', customerId);
                query.applySort(sortBy, sortDir);
                query.setCurrentPage(currentPage);
                query.setPageSize(pageSize);

                return restClient.get(url + '?' + query.build(), token);
            };

            module.getBillingDocument = (entityId, token) => {
                const url = `/kmk-billingdocuments/${entityId}`;
                return restClient.get(url, token);
            };

            module.getBllingDocumentTypes = ({ typeId, sortBy, sortDir, pageSize, currentPage }, token) => {
                const url = `/kmk-billingdocumenttype/search`;
                const query = new SearchCriteria();
                if (typeId) {
                    query.applyFilter('type_id', typeId);
                } else {
                    query.applyFilter('type_id', null, 'neq');
                }
                query.applySort(sortBy, sortDir);
                query.setCurrentPage(currentPage);
                query.setPageSize(pageSize);

                return restClient.get(url + '?' + query.build(), token);
            };

            module.getBllingDocumentType = (typeId, token) => {
                const url = `/kmk-billingdocumenttype/${typeId}`;
                return restClient.get(url, token);
            };

            module.getBillingFile = (entityId, token) => {
                const url = `/kmk-billingdocuments/file/${entityId}`;
                return restClient.get(url, token);
            };

            return module;
        });

        return client;
    };

    /**
     * Returns billing document types
     * @req.param.customerId Customer id
     * @req.query.sort - Sort by
     * @req.query.sortDir {asc|desc} - Sort direction
     * @req.query.start - Page number
     * @req.query.token
     * @req.query.storeCode
     */
    router.get('/type/:typeId?', (req, res) => {
        const { typeId, ...restParams } = req.params;
        const { token } = req.query;
        const client = createMage2RestClient();
        try {
            client.billingDocuments.getBllingDocumentTypes({ typeId, restParams }, token)
                .then(response => apiStatus(res, response, 200))
                .catch(err => apiError(res, err));
        } catch (e) {
            apiError(res, e);
        }
    });

    /**
     * Returns list of store credits per customer
     * @req.param.customerId Customer id
     * @req.query.sort - Sort by
     * @req.query.sortDir {asc|desc} - Sort direction
     * @req.query.start - Page number
     * @req.query.token
     * @req.query.storeCode
     */
    router.get('/:customerId', (req, res) => {
        const { customerId } = req.params;
        const { token, storeCode, ...restParams } = req.query;
        const client = createMage2RestClient();
        try {
            client.billingDocuments.getBillingDocuments({ customerId, restParams }, token)
                .then(response => apiStatus(res, response, 200))
                .catch(err => apiError(res, err));
        } catch (e) {
            apiError(res, e);
        }
    });

    /**
     * Returns single billing document
     * @req.param.entityId Entity id
     * @req.query.token
     * @req.query.storeCode
     */
    router.get('/single/:entityId', (req, res) => {
        const { entityId } = req.params;
        const { token } = req.query;
        const client = createMage2RestClient();
        try {
            client.billingDocuments.getBillingDocument(entityId, token)
                .then(response => apiStatus(res, response, 200))
                .catch(err => apiError(res, err));
        } catch (e) {
            apiError(res, e);
        }
    });

    /**
     * Return single billing document type
     * @req.param.typeId Type id
     * @req.query.sort - Sort by
     * @req.query.sortDir {asc|desc} - Sort direction
     * @req.query.start - Page number
     * @req.query.token
     * @req.query.storeCode
     */
    router.get('/type/single/:typeId', (req, res) => {
        const { typeId } = req.params;
        const { token } = req.query;
        const client = createMage2RestClient();
        try {
            client.billingDocuments.getBllingDocumentType(typeId, token)
                .then(response => apiStatus(res, response, 200))
                .catch(err => apiError(res, err));
        } catch (e) {
            apiError(res, e);
        }
    });

    router.get('/file/:entityId', (req, res) => {
        const { entityId } = req.params;
        const { token } = req.query;
        const client = createMage2RestClient();
        try {
            client.billingDocuments.getBillingFile(entityId, token)
                .then(response => {
                    if (response && response instanceof Array && response[0]) {
                        const { name, mime, size, content } = response[0];
                        const buffer = new Buffer(content, 'base64');
                        const stream = buffer.toString('ascii');

                        res.set('Content-Type', 'application/octet-stream');
                        res.set('Content-Length', size);
                        res.set('Content-Disposition', 'attachment; filename=' + name);
                        res.status(200).send(stream);
                    } else {
                        apiError(res, 'Server error');
                    }
                })
                .catch(err => apiError(res, err));
        } catch (e) {
            apiError(res, e);
        }
    });

    return {
        domainName: '@grupakmk',
        pluginName: 'billing-documents-plugin',
        route: '/billing-documents',
        router
    };
};
