import { capitalize } from "@mui/material";
import { LightTooltip } from "../MuiUtils/LightTooltip";

interface ListCellRenderProps {
  list: string[];
  noOptionsText?: string;
  subject?: string;
  feminine?: boolean;
}

export const ListCellRender: React.FC<ListCellRenderProps> = ({ list, noOptionsText, subject = "item", feminine }) => {
  return (
    <LightTooltip
      title={
        <div className="flex flex-col gap-0.5 p-2">
          <h6 className="text-lg font-bold">{capitalize(subject)}s:</h6>
          {!list || list.length === 0 ? (
            <span className="text-lg">
              {noOptionsText ?? `Nenhum${feminine ? "a" : ""} ${subject.toLocaleLowerCase()} no projeto`}
            </span>
          ) : (
            list.map((item) => (
              <span className="text-[1rem] text-gray-700" key={item}>
                - {capitalize(item ?? "")}
              </span>
            ))
          )}
        </div>
      }
    >
      <span className="w-full text-center">{list.length ?? 0}</span>
    </LightTooltip>
  );
};
