<template>
    <div v-if="show" class="modal-overlay" @click.self="close">
      <div class="modal-container">
        <div class="modal-header" :style="{ backgroundColor: headerBgColor, color: headerTitleColor }">
          <h3>{{ title }}</h3>
        </div>
        <div class="modal-body">
          <slot name="body">Default body content.</slot>
        </div>
        <div class="modal-footer">
          <slot name="footer">
            <!-- Custom buttons are inserted here -->
          </slot>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      show: {
        type: Boolean,
        required: true,
      },
      title: String,
      headerBgColor: {
        type: String,
        default: '#007BFF', // Example default background color
      },
      headerTitleColor: {
        type: String,
        default: '#FFFFFF', // Example default title color
      },
      modalWidth: {
        type: String,
        default: '80%',
      },
      modalHeight: {
        type: String,
        default: '80%',
      },
      actionSave: Function,
      actionClose: Function,
    },
    emits: ['update:show'],
    methods: {
      close() {
        this.$emit('update:show', false);
      },
      save() {
        if (this.actionSave) {
          this.actionSave();
        }
      },
    },
  };
  </script>
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0; /* Ensure full horizontal coverage */
    bottom: 0; /* Ensure full vertical coverage */
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000; /* Ensure it's above other content */
  }
  
  .modal-container {
    background: white;
    border-radius: 5px;
    width: var(--modal-width, 80%);
    max-width: calc(100% - 40px); /* Ensure it doesn't touch the window edges */
    max-height: calc(100% - 40px); /* Control max height to not touch window edges */
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .modal-header {
    padding: 20px;
  }
  
  .modal-body {
    padding: 20px;
    max-height: calc(100vh - 60px); /* Adjust based on header/footer height */
  }
  
  .modal-footer {
    padding: 20px;
    text-align: right;
    border-top: 1px solid #eee;
  }
  
  button {
    cursor: pointer;
    padding: 10px 20px;
    margin-left: 10px;
    border-radius: 5px;
    border: none;
    color: white;
  }
  
  .save-button {
    background-color: #28a745;
  }
  
  .close-button {
    background-color: #dc3545;
  }
  </style>
  
  