import { API_BASE_URL } from "@/lib/constants";

interface FormData {
  [key: string]: any;
}

export class MailService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = API_BASE_URL || "http://localhost:3001";
  }

  async sendFormResponse(formData: FormData) {
    try {
      await fetch(`${this.apiUrl}/mail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      return "success";
    } catch {
      throw new Error("Failed to send form response");
    }
  }
}

export const mailService = new MailService();
