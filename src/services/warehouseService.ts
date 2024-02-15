// src/services/warehouseService.js
let warehouses = [
    { id: 1, name: "Warehouse A", location: "Location A" },
    { id: 2, name: "Warehouse B", location: "Location B" },
    // Add more mock warehouses as needed
  ];
  
  let nextId = 3;
  
  export default {
    getWarehouses() {
      return Promise.resolve(warehouses);
    },
    getWarehouseDetails(id) {
      const warehouse = warehouses.find((w) => w.id === parseInt(id));
      return Promise.resolve(warehouse);
    },
    addWarehouse(warehouse) {
      const newWarehouse = { ...warehouse, id: nextId++ };
      warehouses.push(newWarehouse);
      return Promise.resolve(newWarehouse);
    },
    updateWarehouse(updatedWarehouse) {
      const index = warehouses.findIndex((w) => w.id === updatedWarehouse.id);
      if (index !== -1) {
        warehouses[index] = updatedWarehouse;
        return Promise.resolve(updatedWarehouse);
      }
      return Promise.reject(new Error("Warehouse not found"));
    },
    deleteWarehouse(id) {
      warehouses = warehouses.filter((w) => w.id !== parseInt(id));
      return Promise.resolve();
    },
  };
  