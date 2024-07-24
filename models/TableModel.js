const connection = require('./ConMysql');

module.exports = {

    getTablesAndZones: function (callback) {
        // First, query the tbl_table
        connection.query('SELECT * FROM tbl_table', (error, tables) => {
            if (error) {
                console.error('Error fetching tables from database:', error);
                return callback(error, null);
            }

            // Next, query the tbl_zones
            connection.query('SELECT * FROM tbl_zones', (error, zones) => {
                if (error) {
                    console.error('Error fetching zones from database:', error);
                    // It's important to return here to avoid calling the callback twice
                    return callback(error, null);
                }

                // If both queries succeed, return the results together
                callback(null, { tables: tables, zones: zones });
            });
        });
    },

    getTablesByZone: function (zoneId, callback) {
        // First query to get tables by zone
        const queryTables = `
            SELECT tbl_table.id_table 
            FROM tbl_table
            JOIN tbl_zones ON tbl_table.zone_name = tbl_zones.zone_name
            WHERE tbl_zones.zone_name = ?
        `;
    
        connection.query(queryTables, [zoneId], (error, tables) => {
            if (error) {
                console.error('Error fetching tables from database:', error);
                return callback(error, null);
            }
    
            // Second query to get all zones, nested within the callback of the first query
            const queryZones = 'SELECT * FROM tbl_zones';
            connection.query(queryZones, (error, zones) => {
                if (error) {
                    console.error('Error fetching zones from database:', error);
                    return callback(error, null);
                }
    
                // If both queries succeed, return the results together
                callback(null, { tables: tables, zones: zones });
            });
        });
    },

    getAllTables: function (callback) {
        connection.query('SELECT * FROM tbl_table', (error, results) => {
            if (error) {
                return callback(error, null);
            } else {

                const table = results.map(table => ({
                    id: table.id_table,
                    name: table.table_name
                }));
                return callback(null, table);
            }
        });
    },

    createTable: function (tableData, callback) {
        // Step 1: Ensure zone_name exists in tbl_zones
        connection.query('SELECT zone_name FROM tbl_zones WHERE zone_name = ?', [tableData.zone_name], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            if (results.length === 0) {
                // zone_name does not exist, insert it into tbl_zones
                connection.query('INSERT INTO tbl_zones (zone_name) VALUES (?)', [tableData.zone_name], (error, results) => {
                    if (error) {
                        return callback(error, null);
                    }
                    // Proceed to insert tables after ensuring zone_name exists
                    insertTables();
                });
            } else {
                // zone_name exists, proceed to insert tables
                insertTables();
            }
        });

        function insertTables() {
            let insertionsCompleted = 0;
            const totalInsertions = parseInt(tableData.id_table); // Assuming this is the user input for the number of tables to create

            for (let i = 1; i <= totalInsertions; i++) {
                // Insert each id_table entry with the specified zone_name
                connection.query('INSERT INTO tbl_table (id_table, zone_name) VALUES (?, ?)', [i, tableData.zone_name], (error, results) => {
                    if (error) {
                        return callback(error, null);
                    }
                    insertionsCompleted++;
                    // Check if all insertions are completed
                    if (insertionsCompleted === totalInsertions) {
                        // All insertions are complete, send result back to the controller
                        callback(null, { message: `${totalInsertions} tables created successfully in zone ${tableData.zone_name}.` });
                    }
                });
            }
        }
    }
};