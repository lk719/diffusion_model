import { getCoordsDataType } from './shader_compiler';
export var CumOpType;
(function (CumOpType) {
    CumOpType["Prod"] = "*";
    CumOpType["Sum"] = "+";
})(CumOpType || (CumOpType = {}));
export class CumProgram {
    constructor(op, outputShape, exclusive, reverse) {
        this.op = op;
        this.outputShape = outputShape;
        this.variableNames = ['x'];
        this.customUniforms = [{ name: 'index', type: 'float' }];
        const rank = this.outputShape.length;
        const initVal = this.op === CumOpType.Prod ? '1.0' : '0.0';
        const val = exclusive ? initVal : `getX(${getCoords(rank, 'coords', this.op)})`;
        const length = this.outputShape[this.outputShape.length - 1];
        let condition = '';
        let idxString = '';
        // When exclusive is set, the cum op becomes roll op that copies the
        // value from the previous index based on the direction specified by the
        // reverse flag.
        if (exclusive) {
            condition = reverse ? `end != ${length - 1}` : 'end != 0';
            idxString = reverse ? 'end + 1' : 'end - 1';
        }
        else {
            condition = reverse ? `end + pow2 < ${length}` : 'end >= pow2';
            idxString = (reverse ? 'end + pow2' : 'end - pow2');
        }
        this.userCode = `
      void main() {
        ${getCoordsDataType(rank)} coords = getOutputCoords();
        int end = ${getFinalCoord(rank, 'coords', this.op)};
        float val = ${val};
        int pow2 = int(pow(2.0, index));
        if (${condition}) {
          int idx = ${idxString};
          ${getFinalCoord(rank, 'coords', this.op)} = idx;
          val ${this.op}= getX(${getCoords(rank, 'coords', this.op)});
        }
        setOutput(val);
      }
    `;
    }
}
function getCoords(rank, name, op) {
    if (rank === 1) {
        return `${name}`;
    }
    else if (rank === 2) {
        return `${name}.x, ${name}.y`;
    }
    else if (rank === 3) {
        return `${name}.x, ${name}.y, ${name}.z`;
    }
    else if (rank === 4) {
        return `${name}.x, ${name}.y, ${name}.z, ${name}.w`;
    }
    else {
        throw new Error(`Cumulative ${op} for rank ${rank} is not yet supported`);
    }
}
function getFinalCoord(rank, name, op) {
    if (rank === 1) {
        return `${name}`;
    }
    else if (rank === 2) {
        return `${name}.y`;
    }
    else if (rank === 3) {
        return `${name}.z`;
    }
    else if (rank === 4) {
        return `${name}.w`;
    }
    else {
        throw new Error(`Cumulative ${op} for rank ${rank} is not yet supported`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VtX2dwdS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3RmanMtYmFja2VuZC13ZWJnbC9zcmMvY3VtX2dwdS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFpQkEsT0FBTyxFQUFDLGlCQUFpQixFQUFjLE1BQU0sbUJBQW1CLENBQUM7QUFFakUsTUFBTSxDQUFOLElBQVksU0FHWDtBQUhELFdBQVksU0FBUztJQUNuQix1QkFBVSxDQUFBO0lBQ1Ysc0JBQVMsQ0FBQTtBQUNYLENBQUMsRUFIVyxTQUFTLEtBQVQsU0FBUyxRQUdwQjtBQUVELE1BQU0sT0FBTyxVQUFVO0lBS3JCLFlBQ1csRUFBYSxFQUFTLFdBQXFCLEVBQUUsU0FBa0IsRUFDdEUsT0FBZ0I7UUFEVCxPQUFFLEdBQUYsRUFBRSxDQUFXO1FBQVMsZ0JBQVcsR0FBWCxXQUFXLENBQVU7UUFMdEQsa0JBQWEsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXRCLG1CQUFjLEdBQUcsQ0FBQyxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQXNCLEVBQUMsQ0FBQyxDQUFDO1FBSy9ELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDO1FBQ3JDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxFQUFFLEtBQUssU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDM0QsTUFBTSxHQUFHLEdBQ0wsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQVEsU0FBUyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUM7UUFDeEUsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUM3RCxJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDbkIsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ25CLG9FQUFvRTtRQUNwRSx3RUFBd0U7UUFDeEUsZ0JBQWdCO1FBQ2hCLElBQUksU0FBUyxFQUFFO1lBQ2IsU0FBUyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsVUFBVSxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztZQUMxRCxTQUFTLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztTQUM3QzthQUFNO1lBQ0wsU0FBUyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUM7WUFDL0QsU0FBUyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQ3JEO1FBRUQsSUFBSSxDQUFDLFFBQVEsR0FBRzs7VUFFVixpQkFBaUIsQ0FBQyxJQUFJLENBQUM7b0JBQ2IsYUFBYSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQztzQkFDcEMsR0FBRzs7Y0FFWCxTQUFTO3NCQUNELFNBQVM7WUFDbkIsYUFBYSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDbEMsSUFBSSxDQUFDLEVBQUUsVUFBVSxTQUFTLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDOzs7O0tBSTlELENBQUM7SUFDSixDQUFDO0NBQ0Y7QUFFRCxTQUFTLFNBQVMsQ0FBQyxJQUFZLEVBQUUsSUFBWSxFQUFFLEVBQWE7SUFDMUQsSUFBSSxJQUFJLEtBQUssQ0FBQyxFQUFFO1FBQ2QsT0FBTyxHQUFHLElBQUksRUFBRSxDQUFDO0tBQ2xCO1NBQU0sSUFBSSxJQUFJLEtBQUssQ0FBQyxFQUFFO1FBQ3JCLE9BQU8sR0FBRyxJQUFJLE9BQU8sSUFBSSxJQUFJLENBQUM7S0FDL0I7U0FBTSxJQUFJLElBQUksS0FBSyxDQUFDLEVBQUU7UUFDckIsT0FBTyxHQUFHLElBQUksT0FBTyxJQUFJLE9BQU8sSUFBSSxJQUFJLENBQUM7S0FDMUM7U0FBTSxJQUFJLElBQUksS0FBSyxDQUFDLEVBQUU7UUFDckIsT0FBTyxHQUFHLElBQUksT0FBTyxJQUFJLE9BQU8sSUFBSSxPQUFPLElBQUksSUFBSSxDQUFDO0tBQ3JEO1NBQU07UUFDTCxNQUFNLElBQUksS0FBSyxDQUFDLGNBQWMsRUFBRSxhQUFhLElBQUksdUJBQXVCLENBQUMsQ0FBQztLQUMzRTtBQUNILENBQUM7QUFFRCxTQUFTLGFBQWEsQ0FBQyxJQUFZLEVBQUUsSUFBWSxFQUFFLEVBQWE7SUFDOUQsSUFBSSxJQUFJLEtBQUssQ0FBQyxFQUFFO1FBQ2QsT0FBTyxHQUFHLElBQUksRUFBRSxDQUFDO0tBQ2xCO1NBQU0sSUFBSSxJQUFJLEtBQUssQ0FBQyxFQUFFO1FBQ3JCLE9BQU8sR0FBRyxJQUFJLElBQUksQ0FBQztLQUNwQjtTQUFNLElBQUksSUFBSSxLQUFLLENBQUMsRUFBRTtRQUNyQixPQUFPLEdBQUcsSUFBSSxJQUFJLENBQUM7S0FDcEI7U0FBTSxJQUFJLElBQUksS0FBSyxDQUFDLEVBQUU7UUFDckIsT0FBTyxHQUFHLElBQUksSUFBSSxDQUFDO0tBQ3BCO1NBQU07UUFDTCxNQUFNLElBQUksS0FBSyxDQUFDLGNBQWMsRUFBRSxhQUFhLElBQUksdUJBQXVCLENBQUMsQ0FBQztLQUMzRTtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgMjAyMiBHb29nbGUgTExDLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICovXG5pbXBvcnQge0dQR1BVUHJvZ3JhbX0gZnJvbSAnLi9ncGdwdV9tYXRoJztcbmltcG9ydCB7Z2V0Q29vcmRzRGF0YVR5cGUsIFVuaWZvcm1UeXBlfSBmcm9tICcuL3NoYWRlcl9jb21waWxlcic7XG5cbmV4cG9ydCBlbnVtIEN1bU9wVHlwZSB7XG4gIFByb2QgPSAnKicsXG4gIFN1bSA9ICcrJyxcbn1cblxuZXhwb3J0IGNsYXNzIEN1bVByb2dyYW0gaW1wbGVtZW50cyBHUEdQVVByb2dyYW0ge1xuICB2YXJpYWJsZU5hbWVzID0gWyd4J107XG4gIHVzZXJDb2RlOiBzdHJpbmc7XG4gIGN1c3RvbVVuaWZvcm1zID0gW3tuYW1lOiAnaW5kZXgnLCB0eXBlOiAnZmxvYXQnIGFzIFVuaWZvcm1UeXBlfV07XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgb3A6IEN1bU9wVHlwZSwgcHVibGljIG91dHB1dFNoYXBlOiBudW1iZXJbXSwgZXhjbHVzaXZlOiBib29sZWFuLFxuICAgICAgcmV2ZXJzZTogYm9vbGVhbikge1xuICAgIGNvbnN0IHJhbmsgPSB0aGlzLm91dHB1dFNoYXBlLmxlbmd0aDtcbiAgICBjb25zdCBpbml0VmFsID0gdGhpcy5vcCA9PT0gQ3VtT3BUeXBlLlByb2QgPyAnMS4wJyA6ICcwLjAnO1xuICAgIGNvbnN0IHZhbCA9XG4gICAgICAgIGV4Y2x1c2l2ZSA/IGluaXRWYWwgOiBgZ2V0WCgke2dldENvb3JkcyhyYW5rLCAnY29vcmRzJywgdGhpcy5vcCl9KWA7XG4gICAgY29uc3QgbGVuZ3RoID0gdGhpcy5vdXRwdXRTaGFwZVt0aGlzLm91dHB1dFNoYXBlLmxlbmd0aCAtIDFdO1xuICAgIGxldCBjb25kaXRpb24gPSAnJztcbiAgICBsZXQgaWR4U3RyaW5nID0gJyc7XG4gICAgLy8gV2hlbiBleGNsdXNpdmUgaXMgc2V0LCB0aGUgY3VtIG9wIGJlY29tZXMgcm9sbCBvcCB0aGF0IGNvcGllcyB0aGVcbiAgICAvLyB2YWx1ZSBmcm9tIHRoZSBwcmV2aW91cyBpbmRleCBiYXNlZCBvbiB0aGUgZGlyZWN0aW9uIHNwZWNpZmllZCBieSB0aGVcbiAgICAvLyByZXZlcnNlIGZsYWcuXG4gICAgaWYgKGV4Y2x1c2l2ZSkge1xuICAgICAgY29uZGl0aW9uID0gcmV2ZXJzZSA/IGBlbmQgIT0gJHtsZW5ndGggLSAxfWAgOiAnZW5kICE9IDAnO1xuICAgICAgaWR4U3RyaW5nID0gcmV2ZXJzZSA/ICdlbmQgKyAxJyA6ICdlbmQgLSAxJztcbiAgICB9IGVsc2Uge1xuICAgICAgY29uZGl0aW9uID0gcmV2ZXJzZSA/IGBlbmQgKyBwb3cyIDwgJHtsZW5ndGh9YCA6ICdlbmQgPj0gcG93Mic7XG4gICAgICBpZHhTdHJpbmcgPSAocmV2ZXJzZSA/ICdlbmQgKyBwb3cyJyA6ICdlbmQgLSBwb3cyJyk7XG4gICAgfVxuXG4gICAgdGhpcy51c2VyQ29kZSA9IGBcbiAgICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgJHtnZXRDb29yZHNEYXRhVHlwZShyYW5rKX0gY29vcmRzID0gZ2V0T3V0cHV0Q29vcmRzKCk7XG4gICAgICAgIGludCBlbmQgPSAke2dldEZpbmFsQ29vcmQocmFuaywgJ2Nvb3JkcycsIHRoaXMub3ApfTtcbiAgICAgICAgZmxvYXQgdmFsID0gJHt2YWx9O1xuICAgICAgICBpbnQgcG93MiA9IGludChwb3coMi4wLCBpbmRleCkpO1xuICAgICAgICBpZiAoJHtjb25kaXRpb259KSB7XG4gICAgICAgICAgaW50IGlkeCA9ICR7aWR4U3RyaW5nfTtcbiAgICAgICAgICAke2dldEZpbmFsQ29vcmQocmFuaywgJ2Nvb3JkcycsIHRoaXMub3ApfSA9IGlkeDtcbiAgICAgICAgICB2YWwgJHt0aGlzLm9wfT0gZ2V0WCgke2dldENvb3JkcyhyYW5rLCAnY29vcmRzJywgdGhpcy5vcCl9KTtcbiAgICAgICAgfVxuICAgICAgICBzZXRPdXRwdXQodmFsKTtcbiAgICAgIH1cbiAgICBgO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldENvb3JkcyhyYW5rOiBudW1iZXIsIG5hbWU6IHN0cmluZywgb3A6IEN1bU9wVHlwZSk6IHN0cmluZyB7XG4gIGlmIChyYW5rID09PSAxKSB7XG4gICAgcmV0dXJuIGAke25hbWV9YDtcbiAgfSBlbHNlIGlmIChyYW5rID09PSAyKSB7XG4gICAgcmV0dXJuIGAke25hbWV9LngsICR7bmFtZX0ueWA7XG4gIH0gZWxzZSBpZiAocmFuayA9PT0gMykge1xuICAgIHJldHVybiBgJHtuYW1lfS54LCAke25hbWV9LnksICR7bmFtZX0uemA7XG4gIH0gZWxzZSBpZiAocmFuayA9PT0gNCkge1xuICAgIHJldHVybiBgJHtuYW1lfS54LCAke25hbWV9LnksICR7bmFtZX0ueiwgJHtuYW1lfS53YDtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEN1bXVsYXRpdmUgJHtvcH0gZm9yIHJhbmsgJHtyYW5rfSBpcyBub3QgeWV0IHN1cHBvcnRlZGApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldEZpbmFsQ29vcmQocmFuazogbnVtYmVyLCBuYW1lOiBzdHJpbmcsIG9wOiBDdW1PcFR5cGUpOiBzdHJpbmcge1xuICBpZiAocmFuayA9PT0gMSkge1xuICAgIHJldHVybiBgJHtuYW1lfWA7XG4gIH0gZWxzZSBpZiAocmFuayA9PT0gMikge1xuICAgIHJldHVybiBgJHtuYW1lfS55YDtcbiAgfSBlbHNlIGlmIChyYW5rID09PSAzKSB7XG4gICAgcmV0dXJuIGAke25hbWV9LnpgO1xuICB9IGVsc2UgaWYgKHJhbmsgPT09IDQpIHtcbiAgICByZXR1cm4gYCR7bmFtZX0ud2A7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBDdW11bGF0aXZlICR7b3B9IGZvciByYW5rICR7cmFua30gaXMgbm90IHlldCBzdXBwb3J0ZWRgKTtcbiAgfVxufVxuIl19