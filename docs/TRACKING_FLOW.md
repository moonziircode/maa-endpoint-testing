# TRACKING & TIMELINE FLOW

```text
1. User enters AWB (e.g. 11004249108088).
2. Backend queries GET /maa-task/order/tracking/{awb}.
3. Backend maps opcodes and status codes using `src/lib/opcode-map.ts`:
   - Opcode 59: Dropoff / Received at Counter
   - Opcode 54: Inbound at Hub / Staging
   - Opcode 52: Outbound Manifest
   - Opcode 408: Sorting Process
   - Opcode 80: Delivered to Consignee
4. Renders responsive vertical timeline.
```
