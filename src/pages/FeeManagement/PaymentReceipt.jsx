import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import {
  FaArrowLeft,
  FaReceipt,
  FaPrint,
  FaSchool,
  FaUser,
  FaCalendar,
  FaMoneyBillWave,
} from "react-icons/fa";

const PaymentReceipt = () => {
  const { paymentId } = useParams();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const { error: showError } = useNotification();

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const res = await axiosSecure.get(`/payments/receipt/${paymentId}`);
        if (res.data.success) {
          setReceipt(res.data.data);
        }
      } catch (err) {
        showError("Failed to load receipt");
      } finally {
        setLoading(false);
      }
    };
    fetchReceipt();
  }, [paymentId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <Loader fullPage={false} message="Loading receipt..." />;

  if (!receipt) {
    return (
      <div className="text-center py-16">
        <p className="text-base-content/60">Receipt not found</p>
        <button
          onClick={() => navigate("/dashboard/fees")}
          className="btn btn-primary btn-sm mt-4"
        >
          Back to Fees
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Actions Bar */}
      <div className="flex items-center justify-between print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm gap-2"
        >
          <FaArrowLeft /> Back
        </button>
        <button onClick={handlePrint} className="btn btn-primary btn-sm gap-2">
          <FaPrint /> Print Receipt
        </button>
      </div>

      {/* Receipt Card */}
      <div className="card bg-base-100 border border-base-300/50 shadow-sm max-w-2xl mx-auto">
        <div className="card-body p-8">
          {/* Organization Header */}
          <div className="text-center border-b border-base-300 pb-6 mb-6">
            {receipt.organization.logo && (
              <img
                src={receipt.organization.logo}
                alt="Logo"
                className="w-16 h-16 mx-auto mb-2 object-contain"
              />
            )}
            <h1 className="text-xl font-bold">
              {receipt.organization.name}
            </h1>
            {receipt.organization.address && (
              <p className="text-sm text-base-content/50">
                {receipt.organization.address}
              </p>
            )}
            {receipt.organization.phone && (
              <p className="text-sm text-base-content/50">
                Phone: {receipt.organization.phone}
              </p>
            )}
            <div className="mt-4">
              <h2 className="text-lg font-bold text-primary flex items-center justify-center gap-2">
                <FaReceipt /> Payment Receipt
              </h2>
            </div>
          </div>

          {/* Receipt Details */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-base-content/50">Receipt No.</p>
              <p className="font-mono font-bold text-primary">
                {receipt.receipt.receiptNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-base-content/50">Date</p>
              <p className="font-medium">
                {new Date(receipt.receipt.paymentDate).toLocaleDateString(
                  "en-GB",
                  { day: "2-digit", month: "short", year: "numeric" }
                )}
              </p>
            </div>
          </div>

          {/* Student Info */}
          <div className="bg-base-200/50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-base-content/50 uppercase mb-2 flex items-center gap-1">
              <FaUser className="text-primary" /> Student Details
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-base-content/50">Name: </span>
                <span className="font-medium">{receipt.student.name}</span>
              </div>
              <div>
                <span className="text-base-content/50">Admission: </span>
                <span>{receipt.student.admissionNumber}</span>
              </div>
              <div>
                <span className="text-base-content/50">Class: </span>
                <span>{receipt.student.className}</span>
              </div>
              <div>
                <span className="text-base-content/50">Section: </span>
                <span>{receipt.student.sectionName}</span>
              </div>
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-base-content/50 uppercase mb-2 flex items-center gap-1">
              <FaCalendar className="text-primary" /> Fee for {receipt.fee.month}
            </h3>

            {receipt.fee.components?.length > 0 && (
              <div className="space-y-1 mb-3">
                {receipt.fee.components.map((comp, i) => (
                  <div key={i} className="flex justify-between text-sm py-1 border-b border-base-300/30">
                    <span>{comp.title}</span>
                    <span>৳{comp.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Total Payable</span>
                <span>৳{receipt.fee.payableAmount?.toLocaleString()}</span>
              </div>
              {receipt.fee.discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>-৳{receipt.fee.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-base-300 pt-1 font-bold">
                <span>Net Amount</span>
                <span>
                  ৳{(
                    (receipt.fee.payableAmount || 0) -
                    (receipt.fee.discount || 0)
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-success/5 border border-success/20 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-success uppercase mb-2 flex items-center gap-1">
              <FaMoneyBillWave /> Payment Details
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-base-content/50">Amount Paid: </span>
                <span className="font-bold text-success text-lg">
                  ৳{receipt.receipt.amount.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-base-content/50">Mode: </span>
                <span className="font-medium capitalize">{receipt.receipt.paymentMode}</span>
              </div>
              {receipt.receipt.transactionId && (
                <div>
                  <span className="text-base-content/50">Transaction ID: </span>
                  <span className="font-mono">{receipt.receipt.transactionId}</span>
                </div>
              )}
              <div>
                <span className="text-base-content/50">Total Paid: </span>
                <span>৳{receipt.fee.totalPaid?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-base-content/50">Remaining: </span>
                <span className={receipt.fee.remaining > 0 ? "text-error font-bold" : "text-success"}>
                  ৳{receipt.fee.remaining?.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-base-content/50">Fee Status: </span>
                <span className={`badge badge-sm ${
                  receipt.fee.status === "paid"
                    ? "badge-success"
                    : receipt.fee.status === "partial"
                    ? "badge-warning"
                    : "badge-info"
                }`}>
                  {receipt.fee.status}
                </span>
              </div>
            </div>
            {receipt.receipt.notes && (
              <div className="mt-2 text-sm">
                <span className="text-base-content/50">Notes: </span>
                <span>{receipt.receipt.notes}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-base-300">
            <p className="text-xs text-base-content/40">
              Received by: {receipt.receivedBy}
            </p>
            <p className="text-xs text-base-content/40 mt-1">
              This is a computer-generated receipt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceipt;
