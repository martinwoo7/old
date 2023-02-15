import { useContext } from "react";
import { InternalContext } from "../Context/internal";

export const useInternal = () => useContext(InternalContext)