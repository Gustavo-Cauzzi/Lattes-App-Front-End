import { Button } from "@mui/material";
import { FiChevronLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export const NotFoundRoute: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center flex-col">
      <div className="p-4 px-6 rounded-xl font-bold text-2xl bg-primary text-white">404</div>

      <span className="my-4 text-xl">A página requisitada não existe!</span>
      <Button startIcon={<FiChevronLeft />} onClick={() => navigate(-1)}>
        Voltar
      </Button>
    </div>
  );
};
