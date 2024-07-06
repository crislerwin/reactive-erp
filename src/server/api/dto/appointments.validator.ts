import { z } from "zod";

export enum AppointmentTypes {
  "Consultation" = 1,
  "Return" = 2,
}

export const createAppointmentDto = z.object({
  patient_id: z.number(),
  provider_id: z.number(),
  provider_name: z.string(),
  institution_id: z.number(),
  start_time: z.string().datetime(),
  confirmed: z.boolean().optional(),
  patient_missed: z.boolean().optional(),
  end_time: z.string().datetime().optional(),
  is_new_patient: z.boolean().optional(),
  appt_type: z.nativeEnum(AppointmentTypes),
  is_guardian: z.boolean().optional(),
  patient: z
    .object({
      first_name: z.string(),
      last_name: z.string(),
      bio: z.string(),
    })
    .optional(),
});
