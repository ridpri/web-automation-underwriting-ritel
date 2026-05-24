import { useCallback, useState } from "react";
import { OPERATING_QUEUE_SEED, statusTone } from "../operatingLayer.js";

export function useOperatingRecords(activeSessionName) {
  const [operatingRecords, setOperatingRecords] = useState(OPERATING_QUEUE_SEED);
  const [activeTransactionId, setActiveTransactionId] = useState(OPERATING_QUEUE_SEED[0]?.id || "");

  const updateOperatingRecord = useCallback((recordId, patch) => {
    setOperatingRecords((prev) => {
      const current = prev.find((item) => item.id === recordId);
      if (!current) return prev;
      const nextCandidate = {
        ...current,
        ...patch,
        owner: patch.owner || current.owner || activeSessionName,
        statusTone: patch.statusTone || (patch.status ? statusTone(patch.status) : current.statusTone),
      };
      const unchanged =
        nextCandidate.status === current.status &&
        nextCandidate.reason === current.reason &&
        nextCandidate.notes === current.notes &&
        JSON.stringify(nextCandidate.authority || null) === JSON.stringify(current.authority || null) &&
        JSON.stringify(nextCandidate.flags || []) === JSON.stringify(current.flags || []) &&
        JSON.stringify(nextCandidate.timeline || []) === JSON.stringify(current.timeline || []);

      if (unchanged) return prev;

      return prev.map((item) =>
        item.id === recordId
          ? {
              ...item,
              ...patch,
              owner: patch.owner || item.owner || activeSessionName,
              statusTone: patch.statusTone || (patch.status ? statusTone(patch.status) : item.statusTone),
            }
          : item,
      );
    });
  }, [activeSessionName]);

  const getActiveRecord = useCallback((journeyKey) =>
    operatingRecords.find((item) => item.id === activeTransactionId && item.journeyKey === journeyKey) ||
    operatingRecords.find((item) => item.journeyKey === journeyKey) ||
    null,
  [activeTransactionId, operatingRecords]);

  return {
    operatingRecords,
    activeTransactionId,
    setActiveTransactionId,
    updateOperatingRecord,
    getActiveRecord,
  };
}
