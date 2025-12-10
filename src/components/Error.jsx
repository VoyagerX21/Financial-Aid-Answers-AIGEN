import { useLocation, useNavigate } from "react-router-dom";
import "../styles/error.css";

const ErrorPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const {
    statusCode = 500,
    title = "Internal Server Error",
    desc = "Something went wrong. Please try again later.",
    btn = "Try Again",
  } = state || {};

  return (
    <main>
      <div className="container">
        <div className="row">
          <div className="col-md-6 align-self-center">
            <h1>{statusCode}</h1>
            <h2>{title}</h2>
            <p style={{ textAlign: "center" }}>{desc}</p>

            <button className="btn green" onClick={() => navigate("/")}>
              {btn}
            </button>
          </div>

          <div className="col-md-6 align-self-center">
          </div>
        </div>
      </div>
    </main>
  );
};

export default ErrorPage;
