import type { SizeGuide as SizeGuideData } from "@/types";
import "./content.css";

export function SizeGuide({ guide }: { guide: SizeGuideData }) {
  return (
    <section className="size-guide-block" aria-labelledby={`guide-${guide.id}`}>
      <h2 id={`guide-${guide.id}`}>{guide.title}</h2>
      <p>{guide.description}</p>
      <div
        className="size-guide-table-wrap"
        role="region"
        aria-label={`${guide.title} measurements`}
        tabIndex={0}
      >
        <table className="size-guide-table">
          <caption>
            Measurements in {guide.unit === "cm" ? "centimetres" : "inches"} (
            {guide.unit})
          </caption>
          <thead>
            <tr>
              <th scope="col">Size</th>
              {guide.columns.map((column) => (
                <th scope="col" key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {guide.rows.map((row) => (
              <tr key={row.size}>
                <th scope="row">{row.size}</th>
                {row.measurements.map((measurement, index) => (
                  <td key={index}>{measurement}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>{guide.notes}</p>
    </section>
  );
}
