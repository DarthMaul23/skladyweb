<template>
    <div class="modal-backdrop">
      <div class="modal">
        <h2>{{ title }}</h2>
        <p>{{ message }}</p>
        <n-button @click="confirm">Yes</n-button>
        <n-button @click="$emit('close')">No</n-button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      title: String,
      message: String
    },
    emits: ['close', 'on-confirm'],
    methods: {
      confirm() {
        this.$emit('on-confirm');
        this.$emit('close');
      }
    }
  }
  </script>
  
  <style scoped>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .modal {
    background-color: white;
    padding: 20px;
    border-radius: 10px;
  }
  </style>
  