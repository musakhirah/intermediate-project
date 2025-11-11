export const Loading = {
  show() {
    document.getElementById('loading-indicator').style.display = 'flex';
  },
  hide() {
    document.getElementById('loading-indicator').style.display = 'none';
  }
};
