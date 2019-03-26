import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { ReactiveVar } from "meteor/reactive-var";

import Modal from "../components/Modal.jsx";

const title = new ReactiveVar(false);
const content = new ReactiveVar(false);

class ModalStore {
  setTitle(t) {
    title.set(t);
  }
  set(c) {
    content.set(c);
  }
  reset() {
    title.set(false);
    content.set(false);
  }
}

export const modalStore = new ModalStore();

export default withTracker(() => {
  return {
    children: content.get(),
    title: title.get()
  };
})(Modal);
