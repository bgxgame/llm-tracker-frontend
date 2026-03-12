<template>
  <router-view />
</template>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  /* 初始状态禁止左右晃动，垂直滚动由页面内部控制 */
  overflow-x: hidden;
  background-color: #ffffff;
}

/* 隐藏所有默认滚动条，保持页面整洁 (可选，若想保留滚动感则不加) */
::-webkit-scrollbar {
  width: 0px;
}
</style>