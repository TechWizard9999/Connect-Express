#include <napi.h>
#include <vector>
#include <string>
#include <algorithm>
#include <map>
#include <iostream>

using namespace std;

int TimeToMinutes(string timeStr, int day) {
    if (timeStr.empty()) return -1;
    int h = stoi(timeStr.substr(0, 2));
    int m = stoi(timeStr.substr(3, 2));
    int minutes = h * 60 + m;
    return minutes + (day - 1) * 1440;
}

string FormatDuration(int totalMinutes) {
    int h = totalMinutes / 60;
    int m = totalMinutes % 60;
    string hStr = to_string(h);
    string mStr = to_string(m);
    if (m < 10) mStr = "0" + mStr;
    return hStr + "h " + mStr + "m";
}

struct Stop {
    string stationCode;
    string arrivalTime;
    string departureTime;
    int day;
};

struct Train {
    string trainNumber;
    string trainName;
    vector<Stop> stops;
};

Napi::Value FindConnectingRoutes(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 6) {
        Napi::TypeError::New(env, "Expected 6 arguments").ThrowAsJavaScriptException();
        return env.Null();
    }

    Napi::Array jsTrainsFromA = info[0].As<Napi::Array>();
    Napi::Array jsTrainsToB = info[1].As<Napi::Array>();
    string fromCode = info[2].As<Napi::String>();
    string toCode = info[3].As<Napi::String>();
    int minLayover = info[4].As<Napi::Number>();
    int maxLayover = info[5].As<Napi::Number>();

    vector<Train> trainsFromA;
    vector<Train> trainsToB;

    for (uint32_t i = 0; i < jsTrainsFromA.Length(); i++) {
        Napi::Object tObj = jsTrainsFromA.Get(i).As<Napi::Object>();
        Train t;
        t.trainNumber = tObj.Get("trainNumber").As<Napi::String>();
        t.trainName = tObj.Get("trainName").As<Napi::String>();
        
        Napi::Array stopArr = tObj.Get("stops").As<Napi::Array>();
        for (uint32_t j = 0; j < stopArr.Length(); j++) {
            Napi::Object sObj = stopArr.Get(j).As<Napi::Object>();
            Stop s;
            s.stationCode = sObj.Get("stationCode").As<Napi::String>();
            s.arrivalTime = sObj.Has("arrivalTime") && !sObj.Get("arrivalTime").IsNull() ? sObj.Get("arrivalTime").As<Napi::String>().Utf8Value() : "";
            s.departureTime = sObj.Has("departureTime") && !sObj.Get("departureTime").IsNull() ? sObj.Get("departureTime").As<Napi::String>().Utf8Value() : "";
            s.day = sObj.Get("day").As<Napi::Number>().Int32Value();
            t.stops.push_back(s);
        }
        trainsFromA.push_back(t);
    }

    for (uint32_t i = 0; i < jsTrainsToB.Length(); i++) {
        Napi::Object tObj = jsTrainsToB.Get(i).As<Napi::Object>();
        Train t;
        t.trainNumber = tObj.Get("trainNumber").As<Napi::String>();
        t.trainName = tObj.Get("trainName").As<Napi::String>();
        
        Napi::Array stopArr = tObj.Get("stops").As<Napi::Array>();
        for (uint32_t j = 0; j < stopArr.Length(); j++) {
            Napi::Object sObj = stopArr.Get(j).As<Napi::Object>();
            Stop s;
            s.stationCode = sObj.Get("stationCode").As<Napi::String>();
            s.arrivalTime = sObj.Has("arrivalTime") && !sObj.Get("arrivalTime").IsNull() ? sObj.Get("arrivalTime").As<Napi::String>().Utf8Value() : "";
            s.departureTime = sObj.Has("departureTime") && !sObj.Get("departureTime").IsNull() ? sObj.Get("departureTime").As<Napi::String>().Utf8Value() : "";
            s.day = sObj.Get("day").As<Napi::Number>().Int32Value();
            t.stops.push_back(s);
        }
        trainsToB.push_back(t);
    }

    Napi::Array results = Napi::Array::New(env);
    uint32_t resultIndex = 0;

    struct ArrivalInfo { Train* train; Stop fromStop; Stop arrivalStop; };
    map<string, vector<ArrivalInfo>> intermediateFromA;

    for (auto& train : trainsFromA) {
        int fromIdx = -1;
        for (size_t k = 0; k < train.stops.size(); k++) {
            if (train.stops[k].stationCode == fromCode) { fromIdx = k; break; }
        }
        if (fromIdx == -1) continue;

        for (size_t k = fromIdx + 1; k < train.stops.size(); k++) {
            if (train.stops[k].stationCode == toCode) continue;
            ArrivalInfo info = { &train, train.stops[fromIdx], train.stops[k] };
            intermediateFromA[train.stops[k].stationCode].push_back(info);
        }
    }

    for (auto& train2 : trainsToB) {
        int toIdx = -1;
        for (size_t k = 0; k < train2.stops.size(); k++) {
            if (train2.stops[k].stationCode == toCode) { toIdx = k; break; }
        }
        if (toIdx == -1) continue;

        for (int k = 0; k < toIdx; k++) {
            Stop departureStop = train2.stops[k];
            string transferStation = departureStop.stationCode;
            if (transferStation == fromCode) continue;

            if (intermediateFromA.find(transferStation) != intermediateFromA.end()) {
                for (auto& leg1 : intermediateFromA[transferStation]) {
                    if (leg1.train->trainNumber == train2.trainNumber) continue;

                    int arrMins = TimeToMinutes(leg1.arrivalStop.arrivalTime, leg1.arrivalStop.day);
                    int depMins = TimeToMinutes(departureStop.departureTime, departureStop.day);
                    
                    if (arrMins < 0 || depMins < 0) continue;

                    int layover = depMins - arrMins;
                    if (layover < 0) layover += 1440; 
                    
                    if (layover >= minLayover && layover <= maxLayover) {
                        int leg1Start = TimeToMinutes(leg1.fromStop.departureTime, leg1.fromStop.day);
                        int leg1End = TimeToMinutes(leg1.arrivalStop.arrivalTime, leg1.arrivalStop.day);
                        int leg2Start = depMins;
                        int leg2End = TimeToMinutes(train2.stops[toIdx].arrivalTime, train2.stops[toIdx].day);
                        
                        int duration1 = leg1End - leg1Start; if(duration1 < 0) duration1 += 1440;
                        int duration2 = leg2End - leg2Start; if(duration2 < 0) duration2 += 1440;
                        int totalDuration = duration1 + layover + duration2;

                        Napi::Object resObj = Napi::Object::New(env);
                        resObj.Set("type", "connecting");
                        resObj.Set("connectionStation", transferStation);
                        resObj.Set("totalDuration", totalDuration);
                        resObj.Set("totalDurationFormatted", FormatDuration(totalDuration));
                        resObj.Set("layover", layover);
                        resObj.Set("layoverFormatted", FormatDuration(layover));

                        Napi::Object t1Obj = Napi::Object::New(env);
                        t1Obj.Set("trainNumber", leg1.train->trainNumber);
                        t1Obj.Set("trainName", leg1.train->trainName);
                        t1Obj.Set("durationFormatted", FormatDuration(duration1));
                        
                        Napi::Object t1From = Napi::Object::New(env);
                        t1From.Set("stationCode", fromCode);
                        t1From.Set("departureTime", leg1.fromStop.departureTime);
                        t1From.Set("day", leg1.fromStop.day);
                        t1Obj.Set("from", t1From);
                        
                        Napi::Object t1To = Napi::Object::New(env);
                        t1To.Set("stationCode", transferStation);
                        t1To.Set("arrivalTime", leg1.arrivalStop.arrivalTime);
                        t1To.Set("day", leg1.arrivalStop.day);
                        t1Obj.Set("to", t1To);
                        
                        resObj.Set("train1", t1Obj);


                        Napi::Object t2Obj = Napi::Object::New(env);
                        t2Obj.Set("trainNumber", train2.trainNumber);
                        t2Obj.Set("trainName", train2.trainName);
                        t2Obj.Set("durationFormatted", FormatDuration(duration2));
                        
                         Napi::Object t2From = Napi::Object::New(env);
                        t2From.Set("stationCode", transferStation);
                        t2From.Set("departureTime", departureStop.departureTime);
                        t2From.Set("day", departureStop.day);
                        t2Obj.Set("from", t2From);
                        
                        Napi::Object t2To = Napi::Object::New(env);
                        t2To.Set("stationCode", toCode);
                        t2To.Set("arrivalTime", train2.stops[toIdx].arrivalTime);
                        t2To.Set("day", train2.stops[toIdx].day);
                        t2Obj.Set("to", t2To);
                        
                        resObj.Set("train2", t2Obj);

                        results.Set(resultIndex++, resObj);
                    }
                }
            }
        }
    }

    return results;
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "findConnectingRoutes"), Napi::Function::New(env, FindConnectingRoutes));
    return exports;
}

NODE_API_MODULE(route_engine, Init)
