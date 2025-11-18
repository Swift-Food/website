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
      await fetch(`https://swiftfoods-32981ec7b5a4.herokuapp.com/mail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      return "success";
    } catch (error) {
      console.error("Error sending form response:", error);
      throw new Error("Failed to send form response");
    }
  }
}

export const mailService = new MailService();
