import DescriptionField from "../../fields/DescriptionField";
import NameField from "../../fields/NameField";
import TimeLogList from "../timelog/TimeLogList";
import "./JobPopup.css";
import PopupContainer from "../../popup/PopupContainer";

interface IJobPopupParams {
  jobId: string,
  onClose: () => void,
  isOpen: boolean
}

const JobPopup = ({ jobId, onClose, isOpen }: IJobPopupParams) => {
  return <PopupContainer
    isOpen={isOpen} className="job-popup"
    onClose={onClose} showCloseButton onRequestClose={onClose}
    closeOnEsc closeOnOverlayClick
  >
    <NameField id={jobId} />
    <DescriptionField id={jobId} />
    <TimeLogList jobId={jobId} />
  </PopupContainer>;
}

export default JobPopup;