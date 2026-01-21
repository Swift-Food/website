"use client";

import React, { useState } from "react";
import { mailService } from '@/services/utilities/mail.service';
import { Send, Mail, CheckCircle2, Globe } from 'lucide-react';

// Types for form data
interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

const ContactForm = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Combine firstName and lastName for the backend
      const submissionData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        description: formData.message,
      };

      await mailService.sendFormResponse(submissionData);

      setIsSuccess(true);

      // Reset form after success
      setFormData({ firstName: "", lastName: "", email: "", message: "" });
    } catch (error) {
      console.error("Error sending form:", error);
      setError("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ firstName: "", lastName: "", email: "", message: "" });
    setIsSuccess(false);
    setError(null);
  };

  if (isSuccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 bg-white pt-20">
        <div className="text-center max-w-md animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-pink-50 text-primary rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={40} strokeWidth={1.5} />
          </div>
          <h2 className="text-4xl font-black tracking-tighter uppercase mb-4 text-black">Thank you</h2>
          <p className="text-gray-400 font-light leading-relaxed mb-10">
            We've received your message and our team will get back to you as soon as possible.
          </p>
          <button
            onClick={resetForm}
            className="text-[10px] font-black uppercase tracking-[0.4em] text-primary border-b-2 border-primary pb-1 hover:text-black hover:border-black transition-all"
          >
            Back to contact form
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-24 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

          {/* Left Column: Info & Notes */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="mb-12">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-black leading-none mb-6">
                Contact us
              </h1>
              <div className="space-y-4">
                <p className="text-xl text-black font-bold leading-tight">
                  We'd love to hear from you
                </p>
                <p className="text-lg text-gray-400 font-light leading-relaxed">
                  If you have any questions please contact our team.
                </p>
              </div>
            </div>

            <div className="space-y-10">
              {/* Integration Note */}
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary">
                  <Globe size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-black mb-2">Platform Inquiries</h3>
                  <p className="text-sm text-gray-500 font-light leading-relaxed">
                    For inquiries to incorporate our catering flow into your website, contact us also. We offer flexible solutions for tech partners.
                  </p>
                </div>
              </div>

              {/* Direct Email Note */}
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-black mb-2">Don't like forms?</h3>
                  <a
                    href="mailto:swiftfooduk@gmail.com"
                    className="text-lg font-black tracking-tight text-primary hover:text-black transition-colors"
                  >
                    swiftfooduk@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: The Form */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-gray-100 rounded-[32px] p-8 md:p-12 shadow-[0_24px_60px_rgba(0,0,0,0.03)]">
              <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">First Name</label>
                    <input
                      required
                      type="text"
                      placeholder="Enter your first name"
                      className="w-full bg-white border-transparent border-b-gray-100 border-b-2 px-0 py-4 focus:ring-0 focus:border-[#ff4fa5] transition-all text-black font-medium"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Last Name</label>
                    <input
                      required
                      type="text"
                      placeholder="Enter your last name"
                      className="w-full bg-white border-transparent border-b-gray-100 border-b-2 px-0 py-4 focus:ring-0 focus:border-primary transition-all text-black font-medium"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                  <input
                    required
                    type="email"
                    placeholder="name@company.com"
                    className="w-full bg-white border-transparent border-b-gray-100 border-b-2 px-0 py-4 focus:ring-0 focus:border-primary transition-all text-black font-medium"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Message</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="How can we help you?"
                    className="w-full bg-white border-transparent border-b-gray-100 border-b-2 px-0 py-4 focus:ring-0 focus:border-primary transition-all text-black font-medium resize-none"
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-black text-white py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-xs flex items-center justify-center gap-4 hover:bg-[#ff4fa5] transition-all group ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                  {!isSubmitting && <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
