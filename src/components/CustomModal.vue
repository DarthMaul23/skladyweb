<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="modal-container" :style="{ width: modalWidth, height: modalHeight }">
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
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 5px;
  max-width: calc(100% - 40px);
  min-width: calc(60% - 40px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 20px;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  max-height: calc(100vh - 160px);
  flex-grow: 1;
}

.modal-footer {
  padding: 20px;
  text-align: right;
  border-top: 1px solid #eee;
  flex-shrink: 0;
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
