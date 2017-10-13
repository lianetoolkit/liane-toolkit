export default class ModalsStore {
  constructor() {
    this.currentModal = null;
    this.subscriptions = [];
  }
  setCurrentModal({ modalType, modalData }) {
    console.log("ModalsStore.setCurrentModal", { modalType, modalData });
    this.currentModal = { modalType, modalData };
    this.subscriptions.forEach(f => f());
  }
  removeModal() {
    console.log("removeModal");
    this.currentModal = null;
    this.subscriptions.forEach(f => f());
  }
  subscribe(f) {
    this.subscriptions.push(f);
  }
}
