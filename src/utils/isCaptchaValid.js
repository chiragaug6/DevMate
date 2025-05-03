const isCaptchaValid = async (token) => {
  try {
    const formData = new FormData();
    formData.append("secret", process.env.TURNSTILE_SECRET_KEY);
    formData.append("response", token);

    const verificationUrl =
      "https://challenges.cloudflare.com/turnstile/v0/siteverify";

    const response = await fetch(verificationUrl, {
      method: "POST",
      body: formData,
    });

    const verificationResult = await response.json();

    return verificationResult.success;
  } catch (err) {
    console.error("Captcha verification failed:", err);
    return false;
  }
};

module.exports = isCaptchaValid;
