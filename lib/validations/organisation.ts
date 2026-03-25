import { OrganizationInviteData } from "@/lib/interfaces/organisation";
import * as yup from "yup";

const organisationValidations = {
  async organizationInvite(payload: OrganizationInviteData) {
    const schema = yup.object({
      email: yup
        .string()
        .email("Please enter a valid email address")
        .required("Email is required"),
    });

    return await schema.validate(payload, { abortEarly: false });
  },
};

export default organisationValidations;
