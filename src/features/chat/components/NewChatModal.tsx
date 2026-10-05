import type {
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
} from "react-hook-form";
import type { NewChatForm } from "../types";

interface NewChatModalProps {
  registerChat: UseFormRegister<NewChatForm>;
  submitChat: UseFormHandleSubmit<NewChatForm>;
  errors: FieldErrors<NewChatForm>;
  onCreateChat: (data: NewChatForm) => Promise<void>;
  onClose: () => void;
}

export function NewChatModal({
  registerChat,
  submitChat,
  errors,
  onCreateChat,
  onClose,
}: NewChatModalProps) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>New chat</h2>
            <p>Enter recipient phone number.</p>
          </div>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={submitChat(onCreateChat)} className="form">
          <label>
            Phone number
            <input
              {...registerChat("phone", {
                required: "Phone number is required",
                minLength: {
                  value: 8,
                  message: "Enter a valid phone number",
                },
              })}
              placeholder="+998 90 123 45 67"
              autoFocus
            />
            {errors.phone && (
              <span className="field-error">{errors.phone.message}</span>
            )}
          </label>
          <button className="primary-button" type="submit">
            Create chat
          </button>
        </form>
      </div>
    </div>
  );
}
