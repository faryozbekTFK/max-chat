import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { useAuthStore } from "../../../store/auth.store";
import { Credentials } from "../../../types/chat";
import { api } from "../../../helper/api";

export const useAuth = () => {
  const navigate = useNavigate();
  const setCredentials = useAuthStore((state) => state.setCredentials);

  return useMutation({
    mutationKey: ["auth"],
    mutationFn: async (credentials: Credentials) => {
      const response = await api.get(
        `waInstance${credentials.idInstance}/getStateInstance/${credentials.apiTokenInstance}`,
      );

      if (response?.data?.stateInstance === "authorized")
        return { ...response, data: { ...response?.data, credentials } };

      return response;
    },
    onSuccess: (res) => {
      if (res?.status === 200 && res?.data?.stateInstance === "authorized") {
        setCredentials(res?.data?.credentials);
        navigate("/", { replace: true });
      }
    },
  });
};
