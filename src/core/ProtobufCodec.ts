/**
 * ProtobufCodec.ts - Complete Protocol Buffers Serialization, Deserialization,
 * Enum Mappings, Field Builders, and RPC Service Engine.
 * 
 * Replicated from Google Protobuf & Telegram Android Breakpad Subsystem
 * (java_enum.cc, java_enum_field.cc, java_extension.cc, java_field.cc,
 *  java_file.cc, java_generator.cc, java_helpers.cc, java_message.cc,
 *  java_message_field.cc, java_primitive_field.cc, java_service.cc).
 */

export namespace GoogleProtobuf {
  // ===================================================================
  // 1. Wire Format Constants & Bit Mask Utilities (from java_helpers.cc)
  // ===================================================================

  export enum WireType {
    VARINT = 0,
    FIXED64 = 1,
    LENGTH_DELIMITED = 2,
    START_GROUP = 3,
    END_GROUP = 4,
    FIXED32 = 5,
  }

  export const TAG_TYPE_BITS = 3;
  export const TAG_TYPE_MASK = (1 << TAG_TYPE_BITS) - 1;

  export function makeTag(fieldNumber: number, wireType: WireType): number {
    return (fieldNumber << TAG_TYPE_BITS) | wireType;
  }

  export function getTagFieldNumber(tag: number): number {
    return tag >>> TAG_TYPE_BITS;
  }

  export function getTagWireType(tag: number): WireType {
    return (tag & TAG_TYPE_MASK) as WireType;
  }

  export const BIT_MASKS = [
    0x00000001, 0x00000002, 0x00000004, 0x00000008,
    0x00000010, 0x00000020, 0x00000040, 0x00000080,
    0x00000100, 0x00000200, 0x00000400, 0x00000800,
    0x00001000, 0x00002000, 0x00004000, 0x00008000,
    0x00010000, 0x00020000, 0x00040000, 0x00080000,
    0x00100000, 0x00200000, 0x00400000, 0x00800000,
    0x01000000, 0x02000000, 0x04000000, 0x08000000,
    0x10000000, 0x20000000, 0x40000000, -0x80000000, // 0x80000000 signed 32-bit
  ];

  export class BitFieldTracker {
    private bitFields: number[] = [0];

    public getBit(bitIndex: number): boolean {
      const fieldIdx = Math.floor(bitIndex / 32);
      const mask = BIT_MASKS[bitIndex % 32];
      return ((this.bitFields[fieldIdx] || 0) & mask) === mask;
    }

    public setBit(bitIndex: number): void {
      const fieldIdx = Math.floor(bitIndex / 32);
      while (this.bitFields.length <= fieldIdx) {
        this.bitFields.push(0);
      }
      this.bitFields[fieldIdx] |= BIT_MASKS[bitIndex % 32];
    }

    public clearBit(bitIndex: number): void {
      const fieldIdx = Math.floor(bitIndex / 32);
      if (fieldIdx < this.bitFields.length) {
        this.bitFields[fieldIdx] &= ~BIT_MASKS[bitIndex % 32];
      }
    }

    public clearAll(): void {
      this.bitFields = [0];
    }
  }

  // ===================================================================
  // 2. Coded Streams (from java_message.cc & java_primitive_field.cc)
  // ===================================================================

  export class CodedOutputStream {
    private buffer: Uint8Array;
    private position: number = 0;

    constructor(initialCapacity: number = 256) {
      this.buffer = new Uint8Array(initialCapacity);
    }

    private ensureCapacity(neededBytes: number): void {
      if (this.position + neededBytes > this.buffer.length) {
        let newCap = this.buffer.length * 2;
        while (newCap < this.position + neededBytes) {
          newCap *= 2;
        }
        const newBuf = new Uint8Array(newCap);
        newBuf.set(this.buffer);
        this.buffer = newBuf;
      }
    }

    public writeRawByte(value: number): void {
      this.ensureCapacity(1);
      this.buffer[this.position++] = value & 0xff;
    }

    public writeRawBytes(bytes: Uint8Array): void {
      this.ensureCapacity(bytes.length);
      this.buffer.set(bytes, this.position);
      this.position += bytes.length;
    }

    public writeRawVarint32(value: number): void {
      this.ensureCapacity(5);
      let v = value >>> 0;
      while ((v & ~0x7f) !== 0) {
        this.buffer[this.position++] = (v & 0x7f) | 0x80;
        v >>>= 7;
      }
      this.buffer[this.position++] = v & 0x7f;
    }

    public writeRawVarint64(value: bigint): void {
      this.ensureCapacity(10);
      let v = BigInt.asUintN(64, value);
      const mask7 = BigInt(0x7f);
      const mask80 = BigInt(0x80);
      while (v > mask7) {
        this.buffer[this.position++] = Number((v & mask7) | mask80);
        v >>= BigInt(7);
      }
      this.buffer[this.position++] = Number(v & mask7);
    }

    public writeRawLittleEndian32(value: number): void {
      this.ensureCapacity(4);
      this.buffer[this.position++] = value & 0xff;
      this.buffer[this.position++] = (value >> 8) & 0xff;
      this.buffer[this.position++] = (value >> 16) & 0xff;
      this.buffer[this.position++] = (value >> 24) & 0xff;
    }

    public writeRawLittleEndian64(value: bigint): void {
      this.ensureCapacity(8);
      let v = BigInt.asUintN(64, value);
      for (let i = 0; i < 8; i++) {
        this.buffer[this.position++] = Number(v & BigInt(0xff));
        v >>= BigInt(8);
      }
    }

    public writeTag(fieldNumber: number, wireType: WireType): void {
      this.writeRawVarint32(makeTag(fieldNumber, wireType));
    }

    public writeInt32(fieldNumber: number, value: number): void {
      this.writeTag(fieldNumber, WireType.VARINT);
      this.writeRawVarint32(value >= 0 ? value : value >>> 0);
    }

    public writeUInt32(fieldNumber: number, value: number): void {
      this.writeTag(fieldNumber, WireType.VARINT);
      this.writeRawVarint32(value >>> 0);
    }

    public writeSInt32(fieldNumber: number, value: number): void {
      this.writeTag(fieldNumber, WireType.VARINT);
      // ZigZag encode
      this.writeRawVarint32((value << 1) ^ (value >> 31));
    }

    public writeInt64(fieldNumber: number, value: bigint): void {
      this.writeTag(fieldNumber, WireType.VARINT);
      this.writeRawVarint64(value);
    }

    public writeBool(fieldNumber: number, value: boolean): void {
      this.writeTag(fieldNumber, WireType.VARINT);
      this.writeRawByte(value ? 1 : 0);
    }

    public writeFloat(fieldNumber: number, value: number): void {
      this.writeTag(fieldNumber, WireType.FIXED32);
      const fbuf = new ArrayBuffer(4);
      new Float32Array(fbuf)[0] = value;
      const ibuf = new Uint8Array(fbuf);
      this.writeRawBytes(ibuf);
    }

    public writeDouble(fieldNumber: number, value: number): void {
      this.writeTag(fieldNumber, WireType.FIXED64);
      const fbuf = new ArrayBuffer(8);
      new Float64Array(fbuf)[0] = value;
      const ibuf = new Uint8Array(fbuf);
      this.writeRawBytes(ibuf);
    }

    public writeString(fieldNumber: number, value: string): void {
      this.writeTag(fieldNumber, WireType.LENGTH_DELIMITED);
      const encoded = new TextEncoder().encode(value);
      this.writeRawVarint32(encoded.length);
      this.writeRawBytes(encoded);
    }

    public writeBytes(fieldNumber: number, value: Uint8Array): void {
      this.writeTag(fieldNumber, WireType.LENGTH_DELIMITED);
      this.writeRawVarint32(value.length);
      this.writeRawBytes(value);
    }

    public writeEnum(fieldNumber: number, value: number): void {
      this.writeInt32(fieldNumber, value);
    }

    public writeEnumNoTag(value: number): void {
      this.writeRawVarint32(value >= 0 ? value : value >>> 0);
    }

    public writeMessage(fieldNumber: number, message: MessageLite): void {
      this.writeTag(fieldNumber, WireType.LENGTH_DELIMITED);
      const size = message.getSerializedSize();
      this.writeRawVarint32(size);
      message.writeTo(this);
    }

    public toByteArray(): Uint8Array {
      return this.buffer.slice(0, this.position);
    }

    // Static size computation utilities
    public static computeTagSize(fieldNumber: number): number {
      return CodedOutputStream.computeRawVarint32Size(makeTag(fieldNumber, WireType.VARINT));
    }

    public static computeRawVarint32Size(value: number): number {
      const v = value >>> 0;
      if ((v & (0xffffffff << 7)) === 0) return 1;
      if ((v & (0xffffffff << 14)) === 0) return 2;
      if ((v & (0xffffffff << 21)) === 0) return 3;
      if ((v & (0xffffffff << 28)) === 0) return 4;
      return 5;
    }

    public static computeInt32Size(fieldNumber: number, value: number): number {
      return CodedOutputStream.computeTagSize(fieldNumber) + CodedOutputStream.computeRawVarint32Size(value >= 0 ? value : 0xffffffff);
    }

    public static computeStringSize(fieldNumber: number, value: string): number {
      const len = new TextEncoder().encode(value).length;
      return CodedOutputStream.computeTagSize(fieldNumber) + CodedOutputStream.computeRawVarint32Size(len) + len;
    }

    public static computeEnumSize(fieldNumber: number, value: number): number {
      return CodedOutputStream.computeInt32Size(fieldNumber, value);
    }

    public static computeEnumSizeNoTag(value: number): number {
      return CodedOutputStream.computeRawVarint32Size(value >= 0 ? value : 0xffffffff);
    }

    public static computeMessageSize(fieldNumber: number, message: MessageLite): number {
      const size = message.getSerializedSize();
      return CodedOutputStream.computeTagSize(fieldNumber) + CodedOutputStream.computeRawVarint32Size(size) + size;
    }
  }

  export class CodedInputStream {
    private buffer: Uint8Array;
    private position: number = 0;
    private currentLimit: number;

    constructor(buffer: Uint8Array) {
      this.buffer = buffer;
      this.currentLimit = buffer.length;
    }

    public readTag(): number {
      if (this.isAtEnd()) {
        return 0;
      }
      return this.readRawVarint32();
    }

    public isAtEnd(): boolean {
      return this.position >= this.currentLimit;
    }

    public readRawByte(): number {
      if (this.position >= this.currentLimit) {
        throw new Error('Protobuf: Truncated message or end of stream.');
      }
      return this.buffer[this.position++];
    }

    public readRawBytes(size: number): Uint8Array {
      if (this.position + size > this.currentLimit) {
        throw new Error('Protobuf: Truncated message byte stream.');
      }
      const slice = this.buffer.slice(this.position, this.position + size);
      this.position += size;
      return slice;
    }

    public readRawVarint32(): number {
      let result = 0;
      let shift = 0;
      while (shift < 32) {
        const b = this.readRawByte();
        result |= (b & 0x7f) << shift;
        if ((b & 0x80) === 0) {
          return result >>> 0;
        }
        shift += 7;
      }
      throw new Error('Protobuf: Malformed varint32.');
    }

    public readRawVarint64(): bigint {
      let result = BigInt(0);
      let shift = BigInt(0);
      while (shift < BigInt(64)) {
        const b = this.readRawByte();
        result |= BigInt(b & 0x7f) << shift;
        if ((b & 0x80) === 0) {
          return result;
        }
        shift += BigInt(7);
      }
      throw new Error('Protobuf: Malformed varint64.');
    }

    public readInt32(): number {
      return this.readRawVarint32() | 0;
    }

    public readUInt32(): number {
      return this.readRawVarint32() >>> 0;
    }

    public readSInt32(): number {
      const n = this.readRawVarint32();
      return (n >>> 1) ^ -(n & 1);
    }

    public readInt64(): bigint {
      return this.readRawVarint64();
    }

    public readBool(): boolean {
      return this.readRawVarint32() !== 0;
    }

    public readFloat(): number {
      const bytes = this.readRawBytes(4);
      return new Float32Array(bytes.buffer, bytes.byteOffset, 1)[0];
    }

    public readDouble(): number {
      const bytes = this.readRawBytes(8);
      return new Float64Array(bytes.buffer, bytes.byteOffset, 1)[0];
    }

    public readString(): string {
      const length = this.readRawVarint32();
      const bytes = this.readRawBytes(length);
      return new TextDecoder().decode(bytes);
    }

    public readBytes(): Uint8Array {
      const length = this.readRawVarint32();
      return this.readRawBytes(length);
    }

    public readEnum(): number {
      return this.readInt32();
    }

    public pushLimit(byteLimit: number): number {
      const oldLimit = this.currentLimit;
      const newLimit = this.position + byteLimit;
      if (newLimit > oldLimit) {
        throw new Error('Protobuf: New limit exceeds existing limit.');
      }
      this.currentLimit = newLimit;
      return oldLimit;
    }

    public popLimit(oldLimit: number): void {
      this.currentLimit = oldLimit;
    }

    public getBytesUntilLimit(): number {
      return this.currentLimit - this.position;
    }

    public skipField(tag: number): boolean {
      const wireType = getTagWireType(tag);
      switch (wireType) {
        case WireType.VARINT:
          this.readRawVarint32();
          return true;
        case WireType.FIXED64:
          this.readRawBytes(8);
          return true;
        case WireType.LENGTH_DELIMITED: {
          const length = this.readRawVarint32();
          this.readRawBytes(length);
          return true;
        }
        case WireType.FIXED32:
          this.readRawBytes(4);
          return true;
        case WireType.START_GROUP:
          this.skipMessage();
          return true;
        case WireType.END_GROUP:
          return false;
        default:
          throw new Error(`Protobuf: Invalid wire type ${wireType}`);
      }
    }

    public skipMessage(): void {
      while (true) {
        const tag = this.readTag();
        if (tag === 0 || !this.skipField(tag)) {
          return;
        }
      }
    }
  }

  // ===================================================================
  // 3. Enum Model & Mappings (from java_enum.cc)
  // ===================================================================

  export interface EnumLite {
    getNumber(): number;
  }

  export interface EnumLiteMap<T extends EnumLite> {
    findValueByNumber(number: number): T | null;
  }

  // ===================================================================
  // 4. Message & Builder Core (from java_message.cc)
  // ===================================================================

  export interface MessageLite {
    writeTo(output: CodedOutputStream): void;
    getSerializedSize(): number;
    toByteArray(): Uint8Array;
    isInitialized(): boolean;
  }

  export interface MessageOrBuilder {
    isInitialized(): boolean;
  }

  export interface MessageBuilder<M extends MessageLite> {
    clear(): this;
    build(): M;
    buildPartial(): M;
    mergeFrom(other: M): this;
    mergeFromStream(input: CodedInputStream): this;
  }

  // ===================================================================
  // 5. Unknown Field Set
  // ===================================================================

  export class UnknownFieldSet {
    private fields: Map<number, { wireType: WireType; data: Uint8Array | number | bigint }[]> = new Map();

    public mergeVarintField(fieldNumber: number, value: number): void {
      if (!this.fields.has(fieldNumber)) {
        this.fields.set(fieldNumber, []);
      }
      this.fields.get(fieldNumber)!.push({ wireType: WireType.VARINT, data: value });
    }

    public mergeLengthDelimitedField(fieldNumber: number, data: Uint8Array): void {
      if (!this.fields.has(fieldNumber)) {
        this.fields.set(fieldNumber, []);
      }
      this.fields.get(fieldNumber)!.push({ wireType: WireType.LENGTH_DELIMITED, data });
    }

    public writeTo(output: CodedOutputStream): void {
      for (const [fieldNumber, list] of this.fields.entries()) {
        for (const item of list) {
          if (item.wireType === WireType.VARINT) {
            output.writeInt32(fieldNumber, item.data as number);
          } else if (item.wireType === WireType.LENGTH_DELIMITED) {
            output.writeBytes(fieldNumber, item.data as Uint8Array);
          }
        }
      }
    }

    public getSerializedSize(): number {
      let size = 0;
      for (const [fieldNumber, list] of this.fields.entries()) {
        for (const item of list) {
          if (item.wireType === WireType.VARINT) {
            size += CodedOutputStream.computeInt32Size(fieldNumber, item.data as number);
          } else if (item.wireType === WireType.LENGTH_DELIMITED) {
            const bytes = item.data as Uint8Array;
            size += CodedOutputStream.computeTagSize(fieldNumber) + CodedOutputStream.computeRawVarint32Size(bytes.length) + bytes.length;
          }
        }
      }
      return size;
    }
  }

  // ===================================================================
  // 6. RPC Controller, Callback & Service Subsystem (from java_service.cc)
  // ===================================================================

  export interface RpcController {
    reset(): void;
    failed(): boolean;
    errorText(): string;
    startCancel(): void;
    setFailed(reason: string): void;
    isCanceled(): boolean;
    notifyOnCancel(callback: () => void): void;
  }

  export class BasicRpcController implements RpcController {
    private isFailed: boolean = false;
    private reason: string = '';
    private canceled: boolean = false;
    private cancelListeners: Array<() => void> = [];

    public reset(): void {
      this.isFailed = false;
      this.reason = '';
      this.canceled = false;
      this.cancelListeners = [];
    }

    public failed(): boolean {
      return this.isFailed;
    }

    public errorText(): string {
      return this.reason;
    }

    public startCancel(): void {
      this.canceled = true;
      for (const cb of this.cancelListeners) {
        try {
          cb();
        } catch (e) {
          console.error('[RpcController] Cancel callback error:', e);
        }
      }
    }

    public setFailed(reason: string): void {
      this.isFailed = true;
      this.reason = reason;
    }

    public isCanceled(): boolean {
      return this.canceled;
    }

    public notifyOnCancel(callback: () => void): void {
      this.cancelListeners.push(callback);
    }
  }

  export type RpcCallback<T> = (response: T | null) => void;

  export interface MethodDescriptor {
    name: string;
    index: number;
  }

  export interface ServiceDescriptor {
    name: string;
    methods: MethodDescriptor[];
  }

  export interface Service {
    getDescriptorForType(): ServiceDescriptor;
    callMethod(
      method: MethodDescriptor,
      controller: RpcController,
      request: MessageLite,
      done: RpcCallback<MessageLite>
    ): void;
  }

  // ===================================================================
  // 7. Telegram Breakpad & Diagnostics Crash Telemetry Schema
  //    (Concrete implementation of Protobuf Message, Enum, & Builders)
  // ===================================================================

  export enum CrashSeverity {
    CRASH_SEVERITY_UNKNOWN = 0,
    CRASH_SEVERITY_INFO = 1,
    CRASH_SEVERITY_WARNING = 2,
    CRASH_SEVERITY_ERROR = 3,
    CRASH_SEVERITY_FATAL = 4,
  }

  export namespace CrashSeverity {
    export function valueOf(value: number): CrashSeverity {
      switch (value) {
        case 0: return CrashSeverity.CRASH_SEVERITY_UNKNOWN;
        case 1: return CrashSeverity.CRASH_SEVERITY_INFO;
        case 2: return CrashSeverity.CRASH_SEVERITY_WARNING;
        case 3: return CrashSeverity.CRASH_SEVERITY_ERROR;
        case 4: return CrashSeverity.CRASH_SEVERITY_FATAL;
        default: return CrashSeverity.CRASH_SEVERITY_UNKNOWN;
      }
    }
  }

  export class CrashThreadInfo implements MessageLite {
    public threadId: number = 0;
    public threadName: string = '';
    public isCrashed: boolean = false;
    public callstack: string[] = [];

    private memoizedSerializedSize: number = -1;

    public writeTo(output: CodedOutputStream): void {
      this.getSerializedSize();
      if (this.threadId !== 0) output.writeInt32(1, this.threadId);
      if (this.threadName) output.writeString(2, this.threadName);
      if (this.isCrashed) output.writeBool(3, this.isCrashed);
      for (const frame of this.callstack) {
        output.writeString(4, frame);
      }
    }

    public getSerializedSize(): number {
      let size = 0;
      if (this.threadId !== 0) size += CodedOutputStream.computeInt32Size(1, this.threadId);
      if (this.threadName) size += CodedOutputStream.computeStringSize(2, this.threadName);
      if (this.isCrashed) size += CodedOutputStream.computeTagSize(3) + 1;
      for (const frame of this.callstack) {
        size += CodedOutputStream.computeStringSize(4, frame);
      }
      this.memoizedSerializedSize = size;
      return size;
    }

    public toByteArray(): Uint8Array {
      const output = new CodedOutputStream(this.getSerializedSize() || 32);
      this.writeTo(output);
      return output.toByteArray();
    }

    public isInitialized(): boolean {
      return true;
    }

    public static parseFrom(bytes: Uint8Array): CrashThreadInfo {
      const stream = new CodedInputStream(bytes);
      const info = new CrashThreadInfo();
      while (true) {
        const tag = stream.readTag();
        if (tag === 0) break;
        const fieldNum = getTagFieldNumber(tag);
        switch (fieldNum) {
          case 1: info.threadId = stream.readInt32(); break;
          case 2: info.threadName = stream.readString(); break;
          case 3: info.isCrashed = stream.readBool(); break;
          case 4: info.callstack.push(stream.readString()); break;
          default: stream.skipField(tag); break;
        }
      }
      return info;
    }
  }

  export class CrashReportMessage implements MessageLite {
    public appVersion: string = '10.9.0';
    public platform: string = 'Web (MTProto 2.0 / Layer 184)';
    public severity: CrashSeverity = CrashSeverity.CRASH_SEVERITY_INFO;
    public timestampMs: bigint = BigInt(Date.now());
    public reason: string = '';
    public threads: CrashThreadInfo[] = [];
    public memoryUsageMb: number = 0;

    private memoizedSerializedSize: number = -1;

    public writeTo(output: CodedOutputStream): void {
      this.getSerializedSize();
      if (this.appVersion) output.writeString(1, this.appVersion);
      if (this.platform) output.writeString(2, this.platform);
      if (this.severity !== CrashSeverity.CRASH_SEVERITY_UNKNOWN) {
        output.writeEnum(3, this.severity);
      }
      if (this.timestampMs !== BigInt(0)) {
        output.writeInt64(4, this.timestampMs);
      }
      if (this.reason) output.writeString(5, this.reason);
      for (const th of this.threads) {
        output.writeMessage(6, th);
      }
      if (this.memoryUsageMb !== 0) {
        output.writeFloat(7, this.memoryUsageMb);
      }
    }

    public getSerializedSize(): number {
      let size = 0;
      if (this.appVersion) size += CodedOutputStream.computeStringSize(1, this.appVersion);
      if (this.platform) size += CodedOutputStream.computeStringSize(2, this.platform);
      if (this.severity !== CrashSeverity.CRASH_SEVERITY_UNKNOWN) {
        size += CodedOutputStream.computeEnumSize(3, this.severity);
      }
      if (this.timestampMs !== BigInt(0)) {
        size += CodedOutputStream.computeTagSize(4) + 8; // Varint64 approximate
      }
      if (this.reason) size += CodedOutputStream.computeStringSize(5, this.reason);
      for (const th of this.threads) {
        size += CodedOutputStream.computeMessageSize(6, th);
      }
      if (this.memoryUsageMb !== 0) {
        size += CodedOutputStream.computeTagSize(7) + 4;
      }
      this.memoizedSerializedSize = size;
      return size;
    }

    public toByteArray(): Uint8Array {
      const output = new CodedOutputStream(this.getSerializedSize() || 64);
      this.writeTo(output);
      return output.toByteArray();
    }

    public isInitialized(): boolean {
      return true;
    }

    public static parseFrom(bytes: Uint8Array): CrashReportMessage {
      const stream = new CodedInputStream(bytes);
      const report = new CrashReportMessage();
      report.threads = [];

      while (true) {
        const tag = stream.readTag();
        if (tag === 0) break;
        const fieldNum = getTagFieldNumber(tag);
        switch (fieldNum) {
          case 1: report.appVersion = stream.readString(); break;
          case 2: report.platform = stream.readString(); break;
          case 3: report.severity = CrashSeverity.valueOf(stream.readEnum()); break;
          case 4: report.timestampMs = stream.readInt64(); break;
          case 5: report.reason = stream.readString(); break;
          case 6: {
            const length = stream.readRawVarint32();
            const oldLimit = stream.pushLimit(length);
            const thBytes = stream.readRawBytes(length);
            report.threads.push(CrashThreadInfo.parseFrom(thBytes));
            stream.popLimit(oldLimit);
            break;
          }
          case 7: report.memoryUsageMb = stream.readFloat(); break;
          default: stream.skipField(tag); break;
        }
      }
      return report;
    }
  }

  // Crash Reporting Remote Service matching java_service.cc
  export class CrashReportingServiceClient {
    public static async sendCrashReport(report: CrashReportMessage): Promise<{ ok: boolean; message: string }> {
      try {
        const payload = report.toByteArray();
        const hex = Array.from(payload).map(b => b.toString(16).padStart(2, '0')).join('');
        const res = await fetch('/api/telegram/telemetry/crash-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ protobufHex: hex, timestamp: Date.now() }),
        });
        return await res.json();
      } catch (err: any) {
        console.warn('[CrashReportingService] Report dispatch failed:', err);
        return { ok: false, message: err?.message || 'Network failure' };
      }
    }
  }
}
