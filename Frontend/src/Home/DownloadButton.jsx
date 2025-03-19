import React, { useState } from "react";
import { useSelector } from "react-redux";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import Modal from "react-modal";
import {
  WhatsappShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  FacebookShareButton,
  RedditShareButton,
  EmailShareButton,
} from "react-share";
import {
  FaWhatsapp,
  FaLinkedin,
  FaTwitter,
  FaFacebook,
  FaReddit,
  FaEnvelope,
  FaDownload,
  FaShareAlt,
} from "react-icons/fa";

Modal.setAppElement("#root");

const DownloadButton = () => {
  const score = useSelector((state) => state.score.totalScore);
  const title = useSelector((state) => state.score.title);

  const [format, setFormat] = useState("pdf");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const shareMessage = `🚀 Check out my score on Cluster Protocol! Score: ${score} - Title: ${title}`;
  const shareUrl = "https://your-app-url.com"; // Replace with your actual app URL

  // ✅ Function to Download Score in Selected Format
  const downloadReport = async () => {
    const content = `Your Score: ${score}\nTitle: ${title}`;
    switch (format) {
      case "text":
        downloadText(content);
        break;
      case "pdf":
        await downloadPDF(content);
        break;
      case "img":
        await downloadImage();
        break;
      default:
        downloadPDF(content);
    }
  };

  const downloadText = (content) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "score-report.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadPDF = async (content) => {
    const doc = new jsPDF();
    doc.text(content, 10, 10);
    doc.save("score-report.pdf");
  };

  const downloadImage = async () => {
    const element = document.getElementById("score-card");
    if (element) {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      link.download = "score-report.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col items-center w-[320px]"> {/* Adjusted width */}
      {/* Buttons Section */}
      <div className="mt-6 p-5 w-full bg-black/40 backdrop-blur-md border border-purple-500/30 shadow-xl rounded-lg text-center">
        <h3 className="text-lg font-semibold text-gray-300 mb-3 tracking-wide">
          Download & Share
        </h3>

        {/* Format Selector */}
        <div className="flex items-center space-x-4">
          <select
            onChange={(e) => setFormat(e.target.value)}
            value={format}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none shadow-lg hover:bg-gray-700 transition w-full"
          >
            <option value="pdf">PDF</option>
            <option value="text">Text</option>
            <option value="img">Image</option>
          </select>

          {/* Download Button */}
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg font-semibold shadow-md transform hover:scale-105 transition w-full"
          >
            <FaDownload className="text-lg" /> Download
          </button>
        </div>

        {/* Share Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-4 flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-2 rounded-lg font-semibold shadow-md transform hover:scale-105 transition w-full"
        >
          <FaShareAlt className="text-lg" /> Share
        </button>
      </div>

      {/* Share Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Share Score"
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-md"
      >
        <div className="w-[360px] bg-black/40 backdrop-blur-lg text-white rounded-lg p-6 shadow-2xl border border-purple-500/40">
          <h2 className="text-lg font-bold text-center">Share Your Score</h2>

          {/* Share Buttons in Row Layout */}
          <div className="mt-4 flex justify-center gap-3 flex-wrap">
            <WhatsappShareButton url={shareUrl} title={shareMessage}>
              <button className="flex items-center justify-center gap-2 bg-green-500 px-3 py-2 rounded-lg shadow-lg hover:bg-green-400 transition">
                <FaWhatsapp className="text-lg" />
              </button>
            </WhatsappShareButton>

            <LinkedinShareButton url={shareUrl} summary={shareMessage}>
              <button className="flex items-center justify-center gap-2 bg-blue-600 px-3 py-2 rounded-lg shadow-lg hover:bg-blue-500 transition">
                <FaLinkedin className="text-lg" />
              </button>
            </LinkedinShareButton>

            <TwitterShareButton url={shareUrl} title={shareMessage}>
              <button className="flex items-center justify-center gap-2 bg-blue-400 px-3 py-2 rounded-lg shadow-lg hover:bg-blue-300 transition">
                <FaTwitter className="text-lg" />
              </button>
            </TwitterShareButton>

            <FacebookShareButton url={shareUrl} quote={shareMessage}>
              <button className="flex items-center justify-center gap-2 bg-blue-700 px-3 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition">
                <FaFacebook className="text-lg" />
              </button>
            </FacebookShareButton>

            <RedditShareButton url={shareUrl} title={shareMessage}>
              <button className="flex items-center justify-center gap-2 bg-orange-500 px-3 py-2 rounded-lg shadow-lg hover:bg-orange-400 transition">
                <FaReddit className="text-lg" />
              </button>
            </RedditShareButton>

            <EmailShareButton url={shareUrl} subject="My Score on Cluster Protocol" body={shareMessage}>
              <button className="flex items-center justify-center gap-2 bg-gray-700 px-3 py-2 rounded-lg shadow-lg hover:bg-gray-600 transition">
                <FaEnvelope className="text-lg" />
              </button>
            </EmailShareButton>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setIsModalOpen(false)}
            className="mt-4 w-full bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-400 transition"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default DownloadButton;
