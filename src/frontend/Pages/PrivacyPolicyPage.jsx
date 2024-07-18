import React from "react";
import { Typography, Box } from "@mui/material";
import Header from "../Components/Headers/Header";
import Footer from "../Components/Footer";

const PrivacyPolicyPage = () => {
  return (
    <>
      <Header />
      <Box
        sx={{
          backgroundColor: "black",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          paddingLeft: "90px",
          padding: "100px",
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            color: "turquoise",
            fontFamily: "Times New Roman",
          }}
        >
          Privacy Policy
        </Typography>
        <Box sx={{ marginTop: 2, padding: "10px" }}>
          <Typography
            variant="h5"
            sx={{ color: "white", marginBottom: "10px", fontWeight: "bold" }}
          >
            1. Information We Collect
          </Typography>
          <Typography sx={{ color: "white", marginBottom: "30px" }}>
            At Dream Closet, we collect: Search queries and clothing
            descriptions you enter IP addresses Device information (e.g.,
            browser type, operating system) Browsing behavior on our site
            Account information (if you choose to create an account)
          </Typography>
          <Typography
            variant="h5"
            sx={{ color: "white", marginBottom: "10px", fontWeight: "bold" }}
          >
            {" "}
            2. How We Use Your Information
          </Typography>

          <Typography sx={{ color: "white", marginBottom: "30px" }}>
            We use your information to: Process and respond to your clothing
            search requests Improve our search algorithm and enhance user
            experience Analyze site usage and improve our services Personalize
            your experience and provide tailored recommendations.
          </Typography>

          <Typography
            variant="h5"
            sx={{ color: "white", marginBottom: "10px", fontWeight: "bold" }}
          >
            3. Data Storage and Security Your privacy is important to us.
          </Typography>
          <Typography sx={{ color: "white", marginBottom: "30px" }}>
            We implement industry-standard security measures to protect your
            data: All data is encrypted using SSL technology We regularly update
            our security protocols Access to personal data is restricted to
            authorized personnel only We retain your data for [specify time
            period] or until you request its deletion.
          </Typography>
          <Typography
            variant="h5"
            sx={{ color: "white", marginBottom: "10px", fontWeight: "bold" }}
          >
            4. Sharing Your Information We may share your information with:
          </Typography>

          <Typography sx={{ color: "white", marginBottom: "30px" }}>
            Websites that host the clothing images we display in search results
            Analytics providers to help us improve our service We do not sell
            your personal information to third parties.
          </Typography>

          <Typography
            variant="h5"
            sx={{ color: "white", marginBottom: "10px", fontWeight: "bold" }}
          >
            {" "}
            5. Cookies and Tracking We use cookies to enhance your browsing
            experience:
          </Typography>

          <Typography sx={{ color: "white", marginBottom: "30px" }}>
            Essential cookies: Required for site functionality Analytics
            cookies: Help us understand how you use our site Preference cookies:
            Remember your settings and choices You can manage cookie preferences
            in your browser settings.
          </Typography>

          <Typography
            variant="h5"
            sx={{ color: "white", marginBottom: "10px", fontWeight: "bold" }}
          >
            {" "}
            6. Your Rights You have the right to:
          </Typography>
          <Typography sx={{ color: "white", marginBottom: "30px" }}>
            Access your personal information Request deletion of your data
            Opt-out of marketing communications Lodge a complaint with a
            supervisory authority To exercise these rights, please contact us at
            [Your Contact Email].
          </Typography>

          <Typography
            variant="h5"
            sx={{ color: "white", marginBottom: "10px", fontWeight: "bold" }}
          >
            {" "}
            7. Children's Privacy
          </Typography>

          <Typography sx={{ color: "white", marginBottom: "30px" }}>
            Our service is not directed to children under 13. We do not
            knowingly collect personal information from children under 13.
          </Typography>

          <Typography
            variant="h5"
            sx={{ color: "white", marginBottom: "10px", fontWeight: "bold" }}
          >
            {" "}
            8. Changes to This Policy
          </Typography>
          <Typography sx={{ color: "white", marginBottom: "30px" }}>
            We may update this policy periodically. We will notify you of any
            significant changes via email or a prominent notice on our website.
          </Typography>
          <Typography
            variant="h5"
            sx={{ color: "white", marginBottom: "10px", fontWeight: "bold" }}
          >
            {" "}
            9. Contact Us
          </Typography>

          <Typography sx={{ color: "white", marginBottom: "30px" }}>
            If you have any questions about this privacy policy, please contact
            us at: [Your Company Name] [Address] [Email] [Phone Number]
          </Typography>

          <Typography
            variant="h5"
            sx={{ color: "white", marginBottom: "10px", fontWeight: "bold" }}
          >
            {" "}
            10. Legal Compliance
          </Typography>
          <Typography sx={{ color: "white", marginBottom: "30px" }}>
            This privacy policy complies with applicable data protection laws,
            including GDPR and CCPA.
          </Typography>
          <Typography
            variant="h5"
            sx={{ color: "white", marginBottom: "10px", fontWeight: "bold" }}
          >
            {" "}
            11. Data Retention
          </Typography>
          <Typography sx={{ color: "white", marginBottom: "30px" }}>
            We retain your personal data for as long as necessary to provide our
            services and comply with legal obligations. The criteria used to
            determine our retention periods include: The length of time we have
            an ongoing relationship with you Whether there is a legal obligation
            to which we are subject Whether retention is advisable in light of
            our legal position
          </Typography>
          <Typography
            variant="h5"
            sx={{ color: "white", marginBottom: "10px", fontWeight: "bold" }}
          >
            {" "}
            12. Cross-Border Data Transfers
          </Typography>
          <Typography sx={{ color: "white" }}>
            As we source images from websites globally, your data may be
            transferred to, stored, or processed in countries other than the one
            you reside in. We ensure that such transfers comply with applicable
            data protection laws. By using our service, you consent to this
            privacy policy and our data practices as described herein.
          </Typography>
        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default PrivacyPolicyPage;
