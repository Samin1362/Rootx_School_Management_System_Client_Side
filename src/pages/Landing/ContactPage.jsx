import { useState } from "react";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaCheckCircle,
  FaClock,
  FaHeadset,
} from "react-icons/fa";

const contactInfoItems = [
  {
    icon: FaEnvelope,
    label: "Email",
    value: "support@rootxsoftwares.com",
    sub: "We reply within 24 hours",
  },
  {
    icon: FaPhone,
    label: "Phone",
    value: "+880 1XXX-XXXXXX",
    sub: "Mon–Fri, 9am–6pm BST",
  },
  {
    icon: FaMapMarkerAlt,
    label: "Location",
    value: "Dhaka, Bangladesh",
    sub: "Available globally via cloud",
  },
  {
    icon: FaClock,
    label: "Support Hours",
    value: "9am – 6pm BST",
    sub: "Monday to Friday",
  },
];

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // TODO: replace with real API call when /contact endpoint is available
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setSubmitted(true);
    setLoading(false);
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-primary/3 to-base-100 py-16 px-4 relative overflow-hidden">

      {/* Floating orbs */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-primary/8 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-56 h-56 bg-secondary/8 rounded-full blur-3xl animate-float-reverse pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Page header */}
        <div className="text-center mb-14 animate-fadeInUp">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <FaHeadset className="text-xs" />
            Get In Touch
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-base-content mb-4">
            We&apos;d Love to{" "}
            <span className="text-primary">Hear From You</span>
          </h1>
          <p className="text-base-content/60 text-lg max-w-xl mx-auto leading-relaxed">
            Have questions about RootX SMS? Want to see a demo or discuss custom plans? Send us a message and we&apos;ll get back within 24 hours.
          </p>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Contact Info Panel (2 cols) ── */}
          <div
            className="lg:col-span-2 space-y-4 animate-fadeInUp"
            style={{ animationDelay: "100ms" }}
          >
            {contactInfoItems.map(({ icon: Icon, label, value, sub }) => (
              <div
                key={label}
                className="flex items-start gap-4 p-4 rounded-xl bg-base-100/60 backdrop-blur-sm border border-base-300/50 hover:border-primary/30 hover:translate-x-1 transition-all duration-300 group"
              >
                <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  <Icon className="text-lg" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-0.5">
                    {label}
                  </p>
                  <p className="font-semibold text-base-content text-sm">{value}</p>
                  <p className="text-xs text-base-content/50 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Contact Form (3 cols) ── */}
          <div
            className="lg:col-span-3 animate-fadeInUp"
            style={{ animationDelay: "200ms" }}
          >
            {submitted ? (
              /* Success State */
              <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300/50 p-10 text-center flex flex-col items-center justify-center min-h-80 backdrop-blur-xl">
                <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6">
                  <FaCheckCircle className="text-4xl text-success" />
                </div>
                <h3 className="text-2xl font-bold text-base-content mb-3">
                  Message Sent!
                </h3>
                <p className="text-base-content/60 max-w-sm leading-relaxed mb-6">
                  Thank you for reaching out. Our team will get back to you within 24 hours.
                </p>
                <button
                  onClick={handleReset}
                  className="btn btn-primary btn-sm gap-2"
                >
                  <FaPaperPlane className="text-xs" />
                  Send Another Message
                </button>
              </div>
            ) : (
              /* Form Card */
              <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300/50 p-8 backdrop-blur-xl relative overflow-hidden">
                {/* Corner gradient decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full blur-2xl pointer-events-none" />

                <form onSubmit={handleSubmit} className="space-y-5 relative">
                  <div className="mb-2">
                    <h2 className="text-xl font-bold text-base-content flex items-center gap-2">
                      <FaPaperPlane className="text-primary" />
                      Send Us a Message
                    </h2>
                    <p className="text-sm text-base-content/60 mt-1">
                      Fill in the form below and we'll respond promptly.
                    </p>
                  </div>

                  {/* Name + Email row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label pb-1">
                        <span className="label-text font-medium">
                          Your Name <span className="text-error">*</span>
                        </span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Smith"
                        required
                        className="input input-bordered w-full border-2 border-base-300 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-300 hover:border-base-content/20"
                      />
                    </div>
                    <div className="form-control">
                      <label className="label pb-1">
                        <span className="label-text font-medium">
                          Email Address <span className="text-error">*</span>
                        </span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@school.com"
                        required
                        className="input input-bordered w-full border-2 border-base-300 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-300 hover:border-base-content/20"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="form-control">
                    <label className="label pb-1">
                      <span className="label-text font-medium">
                        Subject <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                      required
                      className="input input-bordered w-full border-2 border-base-300 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-300 hover:border-base-content/20"
                    />
                  </div>

                  {/* Message */}
                  <div className="form-control">
                    <label className="label pb-1">
                      <span className="label-text font-medium">
                        Message <span className="text-error">*</span>
                      </span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us more about your school and what you need..."
                      required
                      rows={5}
                      className="textarea textarea-bordered w-full border-2 border-base-300 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-300 hover:border-base-content/20 resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
                  >
                    {loading ? (
                      <>
                        <span className="loading loading-spinner loading-sm" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inline animation declarations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(20px) scale(1.05); }
        }

        .animate-float         { animation: float 8s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 10s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default ContactPage;
