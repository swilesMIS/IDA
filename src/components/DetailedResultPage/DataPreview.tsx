import React from "react";
import { DatabaseApiItem } from "../../pages/DetailedResultPage/DetailedResultPage";

interface DataPreviewProps {
  database: DatabaseApiItem | null;
}

export const DataPreview: React.FC<DataPreviewProps> = ({ database }) => {
  const fakeData = [
    {
      event_date: "2021-01-01",
      event_type: "test",
      event_description: "test",
      affected_systems: "test",
    },
    {
      event_date: "2021-01-02",
      event_type: "test",
      event_description: "test",
      affected_systems: "test",
    },
    {
      event_date: "2021-01-03",
      event_type: "test",
      event_description: "test",
      affected_systems: "test",
    },
    {
      event_date: "2021-01-04",
      event_type: "test",
      event_description: "test",
      affected_systems: "test",
    },
    {
      event_date: "2021-01-05",
      event_type: "test",
      event_description: "test",
      affected_systems: "test",
    },
    {
      event_date: "2021-01-06",
      event_type: "test",
      event_description: "test",
      affected_systems: "test",
    },
  ];

  return (
    <section className="data-preview">
      <h2 className="data-header">Data Preview:</h2>
      <table>
        <thead>
          <tr>
            <th>Event Date</th>
            <th>Event Type</th>
            <th>Event Description</th>
            <th>Affected Systems</th>
          </tr>
        </thead>
        <tbody>
          {/* {database?.eventData?.map((event, index) => (
            <tr key={index}>
              <td>{event.event_date}</td>
              <td>{event.event_type}</td>
              <td>{event.event_description}</td>
              <td>{event.affected_systems}</td>
            </tr>
          ))} */}

          {/* Uncomment the above code and delete below to use real data once it's added */}

          {fakeData?.map((event, index) => (
            <tr key={index}>
              <td>{event.event_date}</td>
              <td>{event.event_type}</td>
              <td>{event.event_description}</td>
              <td>{event.affected_systems}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};
