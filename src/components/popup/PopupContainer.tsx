import "./PopupContainer.css";
import ReactModal from "react-modal";

interface IPopupContainerParams {
  isOpen: boolean,
  onClose: () => void,
  children: React.ReactNode,
  className?: string,
  showCloseButton?: boolean,
  onRequestClose?: () => void,
  closeOnEsc?: boolean,
  closeOnOverlayClick?: boolean,
}

const PopupContainer = ({ isOpen, onClose, children, className, showCloseButton, onRequestClose, closeOnEsc, closeOnOverlayClick }: IPopupContainerParams) => {
  return <ReactModal
    isOpen={isOpen}
    className={`${className ? className : undefined} form-popup`}
    appElement={document.body}
    shouldCloseOnEsc={closeOnEsc}
    shouldCloseOnOverlayClick={closeOnOverlayClick}
    onRequestClose={onRequestClose}
  >
    {
      showCloseButton ? <button onClick={onClose} className="form-popup-close">Close</button> : undefined
    }
    {children}
  </ReactModal>
}

export default PopupContainer;