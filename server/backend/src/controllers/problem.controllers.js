
import {Problem} from "../models/problemModel.js"
import {OpenAI} from "openai"
import { User } from "../models/userModel.js";
import {UserProblem} from "../models/userProblemModel.js"
import {WebSocket} from "ws"

function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
function evaluateRepeatExpression(expr) {
    try {
      if (
        /^"[^"]*"\.repeat\(\d+\)(\s*\+\s*"[^"]*"\.repeat\(\d+\))*$/.test(expr) ||
        /^"[^"]*"\s*\+\s*".*"$/.test(expr) || // basic string concat
        /^"[^"]+"$/.test(expr) // just quoted string
      ) {
        return eval(expr);
      }
      return expr;
    } catch (e) {
      console.warn("⚠️ Failed eval:", expr);
      return expr;
    }
  }
  
function truncateString(str, maxLength = 1000) {
    if (typeof str === "string" && str.length > maxLength) {
      console.warn(
        `⚠️ Truncating string from ${str.length} to ${maxLength} characters`
      );
      return str.substring(0, maxLength);
    }
    return str;
  }
  
function parseTestCaseJSArray(raw) {
    try {
      console.log("🔍 Raw input received length:", raw.length);
      console.log("🔍 Raw input preview:", raw.substring(0, 500) + "...");
  
      // Step 1: Extract JSON from markdown code blocks if present
      let cleanedContent = raw.trim();
  
      // Remove markdown code blocks (```json ... ``` or ``` ... ```)
      const codeBlockMatch = cleanedContent.match(
        /```(?:json)?\s*([\s\S]*?)\s*```/
      );
      if (codeBlockMatch) {
        cleanedContent = codeBlockMatch[1].trim();
        console.log("🧹 Extracted from code block");
      }
  
      // Step 2: Pre-process and limit string lengths to prevent JSON parsing issues
      console.log("🔧 Processing .repeat() expressions and concatenations...");
  
      // Function to safely evaluate .repeat() expressions with size limits
      const processRepeatExpressions = (content) => {
        // Handle patterns like "100 " + "a".repeat(1000) with size limits
        content = content.replace(
          /"([^"]*?)"\s*\+\s*"([^"]*?)"\.repeat\((\d+)\)/g,
          (match, prefix, str, count) => {
            const repeatCount = Math.min(parseInt(count), 500); // Limit repetitions
            const repeatedString = str.repeat(repeatCount);
            const truncatedResult = truncateString(prefix + repeatedString, 800);
            return `"${truncatedResult}"`;
          }
        );
  
        // Handle simple concatenations like "a" + "b"
        content = content.replace(
          /"([^"]*?)"\s*\+\s*"([^"]*?)"/g,
          (match, str1, str2) => {
            const combined = str1 + str2;
            const truncated = truncateString(combined, 800);
            return `"${truncated}"`;
          }
        );
  
        // Handle standalone .repeat() patterns like "a".repeat(1000) with limits
        content = content.replace(
          /["']([^"']*?)["']\.repeat\((\d+)\)/g,
          (match, str, count) => {
            const repeatCount = Math.min(parseInt(count), 500); // Limit repetitions
            const repeatedString = str.repeat(repeatCount);
            const truncated = truncateString(repeatedString, 800);
            return `"${truncated}"`;
          }
        );
  
        return content;
      };
  
      // Apply repeat processing with limits
      cleanedContent = processRepeatExpressions(cleanedContent);
      console.log("✅ Processed .repeat() expressions and concatenations");
  
      // Step 3: Clean up any remaining formatting issues
      cleanedContent = cleanedContent
        .replace(/^\s*content:\s*'?/, "") // remove `content:` line if present
        .replace(/\\\\n/g, " ") // replace escaped newlines with spaces
        .replace(/\\n/g, " ") // replace newlines with spaces
        .replace(/'\s*\+\s*'/g, "") // join broken string lines
        .replace(/\n/g, " ") // replace actual newlines with spaces
        .trim();
  
      // Step 4: Check for potential JSON truncation issues
      if (!cleanedContent.endsWith("]") && !cleanedContent.endsWith("}")) {
        console.warn("⚠️ Content may be truncated, attempting to fix...");
  
        // Try to find the last complete test case
        const lastCompleteMatch = cleanedContent.lastIndexOf('"}');
        if (lastCompleteMatch !== -1) {
          cleanedContent =
            cleanedContent.substring(0, lastCompleteMatch + 2) + "]";
          console.log(
            "🔧 Fixed truncated JSON by finding last complete test case"
          );
        } else {
          // Fallback: try to close the JSON properly
          if (cleanedContent.includes("[")) {
            cleanedContent = cleanedContent + '"}]';
          }
        }
      }
  
      console.log("🔧 After cleanup length:", cleanedContent.length);
  
      // Step 5: Try to parse as JSON first
      let testCaseArray;
      try {
        testCaseArray = JSON.parse(cleanedContent);
        console.log("✅ Successfully parsed as JSON");
      } catch (jsonError) {
        console.log("⚠️ JSON parse failed, trying alternative methods...");
        console.log("JSON Error:", jsonError.message);
  
        // Step 6: Try to fix common JSON issues
        let fixedContent = cleanedContent
          .replace(/'([^']*)'/g, (_, g1) => `"${g1}"`) // single to double quotes
          .replace(/,\s*]/g, "]") // remove trailing commas in arrays
          .replace(/,\s*}/g, "}") // remove trailing commas in objects
          .replace(/\+\s*"/g, ' "') // fix string concatenation issues
          .replace(/"\s*\+/g, '" ') // fix string concatenation issues
          .replace(/f"[^"]*"/g, '""') // remove f-strings
          .replace(/\.join\([^)]*\)/g, '""') // remove .join expressions
          .replace(/range\([^)]*\)/g, "[]"); // remove range expressions
  
        try {
          testCaseArray = JSON.parse(fixedContent);
          console.log("✅ Successfully parsed after fixing quotes");
        } catch (stillError) {
          console.log("⚠️ Still failed, trying manual cleaning...");
          console.log("Second JSON Error:", stillError.message);
  
          // Step 7: More aggressive cleaning for malformed expressions
          try {
            // Find where the JSON might be broken and try to salvage what we can
            const errorPosition = stillError.message.match(/position (\d+)/);
            if (errorPosition) {
              const pos = parseInt(errorPosition[1]);
              console.log(`🔧 Attempting to fix JSON at position ${pos}`);
  
              // Try to find a safe truncation point before the error
              const safeContent = fixedContent.substring(0, pos);
              const lastCompleteObject = safeContent.lastIndexOf("}");
  
              if (lastCompleteObject !== -1) {
                fixedContent =
                  safeContent.substring(0, lastCompleteObject + 1) + "]";
                console.log("🔧 Truncated to last complete object");
              }
            }
  
            // Remove any remaining complex expressions
            fixedContent = fixedContent
              .replace(/"\s*\+\s*[^"]*\.(repeat|join)[^"]*"/g, '""') // remove complex expressions
              .replace(/"\s*\+\s*[^"]*for\s+[^"]*in[^"]*"/g, '""') // remove list comprehensions
              .replace(/\s+/g, " ") // normalize whitespace
              .replace(/,\s*,/g, ",") // remove double commas
              .replace(/\[\s*,/g, "[") // fix leading commas in arrays
              .replace(/,\s*\]/g, "]") // fix trailing commas in arrays
              .replace(/{\s*,/g, "{") // fix leading commas in objects
              .replace(/,\s*}/g, "}"); // fix trailing commas in objects
  
            testCaseArray = JSON.parse(fixedContent);
            console.log("✅ Successfully parsed after aggressive cleaning");
          } catch (finalError) {
            console.log("❌ Final parse attempt failed:", finalError.message);
  
            // Last resort: try to extract individual test cases using regex
            try {
              const testCaseMatches = cleanedContent.match(
                /\{"input":\s*\[[^\]]*\],\s*"expected":\s*"[^"]*"\}/g
              );
              if (testCaseMatches && testCaseMatches.length > 0) {
                const validTestCases = testCaseMatches
                  .map((match) => {
                    try {
                      return JSON.parse(match);
                    } catch (e) {
                      return null;
                    }
                  })
                  .filter((tc) => tc !== null);
  
                if (validTestCases.length > 0) {
                  testCaseArray = validTestCases;
                  console.log(
                    `✅ Extracted ${validTestCases.length} test cases using regex fallback`
                  );
                } else {
                  throw new Error("No valid test cases could be extracted");
                }
              } else {
                throw new Error(
                  `Cannot parse content. Final error: ${finalError.message}`
                );
              }
            } catch (regexError) {
              throw new Error(
                `Cannot parse content. Final error: ${finalError.message}`
              );
            }
          }
        }
      }
  
      // Step 8: Validate the structure
      if (!Array.isArray(testCaseArray)) {
        throw new Error("Parsed content is not an array");
      }
  
      if (testCaseArray.length === 0) {
        throw new Error("Test case array is empty");
      }
  
      // Step 9: Validate each test case and truncate overly long inputs
      const validTestCases = [];
      for (let i = 0; i < testCaseArray.length; i++) {
        const tc = testCaseArray[i];
        if (tc.input && tc.hasOwnProperty("expected")) {
          // Truncate overly long inputs
          const processedInput = Array.isArray(tc.input)
            ? tc.input.map((inp) => truncateString(String(inp), 1000))
            : [truncateString(String(tc.input), 1000)];
  
          const processedExpected = truncateString(String(tc.expected), 1000);
  
          // Additional validation: check if input is reasonable
          const inputStr = processedInput[0];
          if (
            typeof inputStr === "string" &&
            !inputStr.includes("\\n") &&
            !inputStr.includes("\n") &&
            inputStr.length < 2000 // Reasonable length limit
          ) {
            validTestCases.push({
              input: processedInput,
              expected: processedExpected,
            });
          } else {
            console.warn(`⚠️ Test case ${i} has issues, skipping:`, {
              inputLength: inputStr ? inputStr.length : 0,
              hasNewlines: inputStr
                ? inputStr.includes("\\n") || inputStr.includes("\n")
                : false,
            });
          }
        } else {
          console.warn(
            `⚠️ Test case ${i} missing required fields, skipping:`,
            tc
          );
        }
      }
  
      if (validTestCases.length === 0) {
        throw new Error("No valid test cases found after cleaning");
      }
  
      console.log(
        `✅ Successfully parsed ${validTestCases.length} valid test cases`
      );
  
      // Step 10: Expand any remaining repeat expressions (keeping existing logic for fallback)
      const expanded = validTestCases.map(({ input, expected }, index) => {
        try {
          return {
            input: input.map((e) => {
              const evaluated = evaluateRepeatExpression(JSON.stringify(e));
              return truncateString(evaluated.replace(/^"|"$/g, ""), 1000); // Remove quotes if added by JSON.stringify
            }),
            expected: (() => {
              const evaluated = evaluateRepeatExpression(
                JSON.stringify(expected)
              );
              return truncateString(evaluated.replace(/^"|"$/g, ""), 1000); // Remove quotes if added by JSON.stringify
            })(),
          };
        } catch (error) {
          console.warn(`⚠️ Error processing test case ${index}:`, error);
          return {
            input: input.map((e) => truncateString(String(e), 1000)),
            expected: truncateString(String(expected), 1000),
          };
        }
      });
  
      return { ok: true, data: expanded };
    } catch (err) {
      console.error("❌ Complete parsing failure:", err);
      return { ok: false, error: `❌ Failed to parse: ${err.message}` };
    }
  }
  
function normalizeExpression(expr) {
    // Skip strings that don't look like shorthand
    if (!expr.includes("*")) return expr;
  
    // Add quotes and "+" between parts: convert a*3b*3 → "a"*3 + "b"*3
    const parts = expr.match(/[a-zA-Z ]*\*\d+/g); // Match a*500, b*500, space*300 etc.
    if (!parts) return expr;
  
    return parts
      .map((part) => {
        const [char, num] = part.split("*");
        return `"${char}"*${num}`;
      })
      .join(" + ");
  }
  
function expandShorthandString(expr) {
    // If no '*' or quotes, assume it's a literal string
    if (!expr.includes("*")) return expr;
  
    // Add '+' between string multipliers and next string/multiplier if not already
    expr = expr.replace(/(".?"\s*\*\s*\d+)\s*(?=")/g, "$1 + ");
    expr = expr.replace(/(".?")\s(?=")/g, "$1 + "); // join plain strings too
    expr = expr.replace(/(".?"\s*\*\s*\d+)(?=\s|$)/g, "$1"); // keep others intact
  
    // Now split using '+'
    return expr
      .split("+")
      .map((part) => {
        part = part.trim();
  
        const match = part.match(/^"(.+)"\s*\*\s*(\d+)$/); // "abc" * 3
        if (match) {
          const [, str, count] = match;
          const repeatCount = Math.min(Number(count), 500); // Limit repetitions
          const result = str.repeat(repeatCount);
          return truncateString(result, 1000);
        }
  
        const quoted = part.match(/^"(.+)"$/); // just "abc"
        if (quoted) return truncateString(quoted[1], 1000);
  
        return truncateString(part, 1000); // fallback
      })
      .join("");
  }
  
function expandTestCaseObject(obj) {
    const actualInput = [];
  
    for (let inp of obj.input) {
      const expanded = expandShorthandString(normalizeExpression(inp));
      actualInput.push(truncateString(expanded, 1000));
    }
  
    return {
      input: actualInput,
      expected: truncateString(
        expandShorthandString(normalizeExpression(obj.expected)),
        1000
      ),
    };
  }
  
  // Enhanced prompt for better test case generation with size limits
function generateEnhancedPrompt(problem, constraint, code, language) {
    return [
      {
        role: "system",
        content: `You are an expert competitive programming test case generator. Your primary goal is to create test cases that expose logical flaws, edge cases, and algorithmic weaknesses in the provided code.
  
  CRITICAL REQUIREMENTS:
  
  1. Generate exactly 5-10 test cases total (reduced for better parsing)
  2. Distribution: 80% logic/edge case checkers (4-6 cases) + 20% performance (TLE/MLE) checkers (2-3 cases)
  3. Return ONLY a valid JSON array - no markdown code blocks, no explanations, no extra text
  4. Do NOT wrap your response in \`\`\`json code blocks - return raw JSON only
  5. NEVER use newline characters (\\n) in input strings - they cause parsing errors
  6. NEVER use string concatenation (+) or JavaScript expressions in JSON
  7. For repeated patterns, write out reasonable lengths (max 100 characters per string)
  8. For multi-line inputs, concatenate everything into single strings without \\n
  9. Maximum string length in any test case should be 100 characters
  10. Keep total response under 10KB to prevent truncation
  
  CRITICAL INPUT FORMAT RULES:
  
  ❌ WRONG: ["100 " + "a".repeat(1000)] (contains concatenation)
  ❌ WRONG: ["3\\n1 5\\n2 6\\n3 7"] (contains \\n)
  ❌ WRONG: Very long strings over 100 characters
  ✅ CORRECT: ["3 1 5 2 6 3 7"] (single line, space-separated)
  ✅ CORRECT: ["100 abcdefghijklmnopqrstuvwxyz"] (reasonable length)
  
  FOR REPEATED PATTERNS:
  - Instead of using .repeat(), write out patterns up to 50-100 characters max
  - Focus on algorithmic edge cases rather than extremely long strings
  - Example: "aaaaaaaaaaaaaaaaaaaaaa" (22 a's) instead of "a".repeat(1000)
  
  JSON FORMAT EXAMPLE:
  [
    {"input": ["5"], "expected": "25"},
    {"input": ["0"], "expected": "0"},
    {"input": ["2 1 5 2 6"], "expected": "2"},
    {"input": ["100 abcdefghijklmnopqrstuvwxyz"], "expected": "YES"}
  ]
  
  TEST CASE CATEGORIES (Focus on quality over quantity):
  
  A. Fundamental Edge Cases (1-2 cases):
  - Single word cases
  - Two identical words
  - Minimum constraint cases
  - Words with all same characters
  
  B. Algorithm-Specific Logic Breakers (3-4 cases):
  - Lexicographically challenging cases
  - Cases where sorting creates different orderings
  - Anagram detection edge cases
  - Character frequency analysis tests
  
  C. Character Pattern Edge Cases (2-3 cases):
  - Single character differences
  - Repeated characters in different positions
  - Alphabetical boundary cases
  
  D. Performance Tests (1-2 cases):
  - Larger inputs (N=20-50) with reasonable word lengths
  - Worst-case scenarios for the algorithm
  - Many similar words requiring extensive comparison
  
  RESPONSE SIZE LIMITS:
  - Keep each test case input under 100 characters
  - Total response should be under 10KB
  - Focus on algorithmic complexity, not string length
  - Prefer 4 high-quality test cases over 6 mediocre ones
  
  CRITICAL: Return ONLY the JSON array, no other text, no markdown formatting, no JavaScript expressions, all strings kept to reasonable lengths.`,
      },
      {
        role: "user",
        content: `PROBLEM: ${problem}
  
  CONSTRAINTS: ${constraint}
  
  CODE TO TEST: ${code}
  
  LANGUAGE: ${language}
  
  Generate 5-10 strategic test cases following the rules above. Remember:
  
  - NO \\n characters in input strings
  - NO concatenation (+) or .repeat() expressions  
  - NO JavaScript code in JSON - only pure JSON
  - Keep all strings under 100 characters
  - Multi-line inputs should be single-line space-separated
  - Return ONLY the JSON array
  - Focus on algorithmic edge cases, not string length
  
  Generate the test cases now:`,
      },
    ];
  }
  
  
export const searchProblems=async(req,res)=>{
    try{
    const {text="",tags="",page="1",limit="20"}=req.query;
    const pageNum=Math.max(1,parseInt(page,10)||1);
    const perPage=Math.max(1,parseInt(limit,10)||20);
    const skip=(pageNum-1)*perPage;
    
    //
    const arr=[];
    if(text && text.trim() !==""){
        const newText=escapeRegex(text.trim());
        const finalText=new RegExp(newText,"i");
        arr.push(
        {
            $or:[
                { title: { $regex: finalText } },
          { description: { $regex: finalText } }
            ]
        })

    }
    if(tags && tags.trim()!==""){
        const tagString= tags.split(",").map(t=>t.trim()).filter(Boolean);
        if(tagString.length>0){
           arr.push({
            tags: {$in: tagString}
           })
        }

    }
    const pipeline=[];
    if(arr.length>0){
        pipeline.push({
            $match:{$and: arr}
        })
    }
    pipeline.push({ $sort: { acceptance: -1, title: 1 } });
    
    pipeline.push({
      $facet: {
        results: [
          { $skip: skip },
          { $limit: perPage },
          // Project only fields needed for listing. Remove big fields if not required.
          {
            $project: {
              title: 1,
              description: 1,
              difficulty: 1,
              tags: 1,
              acceptance: 1,
            }
          }
        ],
        totalCount: [
          { $count: "count" } // will produce [{ count: N }] or [] if zero
        ]
      }
    });

    // Execute aggregation
    const aggResult = await Problem.aggregate(pipeline).exec();
    // Extract results and total in a safe way
    const results = (aggResult[0] && aggResult[0].results) || [];
    console.log(results);
    const total = (aggResult[0] && aggResult[0].totalCount[0] && aggResult[0].totalCount[0].count)
      ? aggResult[0].totalCount[0].count
      : 0;

    return res.json({
      page: pageNum,
      limit: perPage,
      total,
      results
    });
}
catch(err){
    console.error("could not search problem, error :", err);
    return res.status(500).json({ error: "Internal server error" });
}
}

export const getProblem=async(req,res)=>{
  try{
  const {id}=req.params;
  const problem=await Problem.find({_id: id});
  if(!problem) {
    res.status(404).json({error: "Problem not found"});
  }
  res.status(200).json(
   problem
  )
}catch(error){
  console.log("error while getting problem :",error);
  res.status(500).json({error: "Internal server error"});
}

}
export const getAllProblems=async(req,res)=>{
  try{
    const pageNo=Math.max(1,parseInt(req.query.page,10)||1);
    const LIMIT=20;
    const skip=(pageNo-1)*LIMIT;
    // for pageNo=1 skip=0 rows, for pageNo=2 skip 20 rows
  const [results, total]=await Promise.all([
    Problem.find().sort({_id:-1}).skip(skip).limit(LIMIT).lean(),Problem.countDocuments()
  ])
  return res.json({
    pageNo,
    limit: LIMIT,
    total,
    results
  });
  }
  catch(error){
    console.log("Error in getAllproblems controller: ", error);
		res.status(500).json({ error: "Internal server error" });
  }
}

export const generateCode=async(req,res)=>{
    
    const openai= new OpenAI({
      apiKey: process.env.OPEN_AI_SECRET_KEY,
    })
  const { problem, constraints, hint, language } = req.body;
 // console.log(problem, constraints);

  
  if (!problem || problem.length === 0) {
    return res.status(400).json({ message: "problem is required" });
  }

  const selectedLanguage = language || "cpp";

  const userId=req.user?._id;
  const user =await User.findById(userId);
  if(!user){
    res.status(404).json({message:"Not authenticated to perform this operation"});
  }
  
   const inputInstructions = {
    python:
      "In Python, the main function should take input from sys.argv (command line arguments). use sys.argv[1], sys.argv[2], etc. for inputs. ALWAYS import sys at the top.",
    cpp: "In C++, the main function should take input directly using cin (e.g., cin >> variable_name). and code should be written in cpp 11",
    java: "In Java, the main function should take input directly using Scanner class.",
    javascript:
      "In JavaScript, use process.argv for command line arguments or readline for interactive input.",
  };


  const messages = [
    {
      role: "system",
      content: `You are a professional coding master, specialized in creating correct and optimized solutions. 
      
      IMPORTANT FORMATTING RULES:
      - Generate a single, complete, ready-to-run solution for ${selectedLanguage}
      - Include all necessary header files/imports at the top
      - The code should be a complete, executable program
      - ${inputInstructions[selectedLanguage] || inputInstructions.cpp}
      - Only print the final answer, nothing else (no prompts like "enter size", etc.)
      - The code should handle input/output properly and contain all the problem-solving logic
      - Make sure the code is optimized and follows best practices
      
      CRITICAL PYTHON REQUIREMENTS (if Python is selected):
      - The Python code MUST start with "import sys" as the first line
      - The Python code MUST use sys.argv for command line arguments (sys.argv[1], sys.argv[2], etc.)
      - The Python code MUST have "if __name__ == '__main__':" at the end to execute the main logic
      - Structure for Python: import sys → functions → main logic → if __name__ == '__main__': main()
      
      RESPONSE FORMAT:
      You must return a JSON object with exactly these properties:
      {
        "explanation": "detailed explanation of the approach and algorithm",
        "completeCode": "the complete, ready-to-run solution code for ${selectedLanguage}"
      }
      
      Do NOT use markdown code blocks or any other formatting. Return only the plain JSON object.`,
    },
    {
      role: "user",
      content: `Generate an optimal complete solution for this problem in ${selectedLanguage}:
      
      Problem: ${problem}
      ${constraints.length ? `Constraints: ${constraints}` : ""}
      ${hint ? `Hint: ${hint}` : ""}
      
      Remember to:
      1. Analyze the problem and choose the appropriate DSA approach
      2. Create a single, complete, executable program
      3. Include all necessary headers/imports
      4. Handle input/output properly according to the language requirements
      5. Make the code optimized and efficient
      6. Return the response in the specified JSON format`,
    },
  ];


   try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.1,
    });
    //console.log(response);
    console.log("OpenAI Response:", response.choices[0].message.content);

    let data;
    try {
      data = JSON.parse(response.choices[0].message.content);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      // Attempt to extract JSON from response if it's wrapped in code blocks
      const content = response.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Invalid JSON response from OpenAI");
      }
    }

    // Validate response structure
    if (!data.explanation || !data.completeCode) {
      throw new Error(
        "Invalid response structure from OpenAI - missing required fields"
      );
    }

    // Additional validation for Python code
    if (selectedLanguage === "python") {
      const pythonCode = data.completeCode;
      const requiredPythonElements = [
        "import sys",
        "def ",
        "sys.argv",
        'if __name__ == "__main__":',
      ];

      const missingElements = requiredPythonElements.filter(
        (element) => !pythonCode.includes(element)
      );

      if (missingElements.length > 0) {
        console.warn("Python code missing elements:", missingElements);
      }
    }

    // Return structured response - keeping the old fields as empty strings for compatibility
    res.status(200).json({
      language: selectedLanguage,
      explanation: data.explanation,
      code: data.completeCode, // New field with the complete solution
      helperFunction: "", // Empty string for backward compatibility
      mainFunction: "", // Empty string for backward compatibility
      pythonMainFunction: "", // Empty string for backward compatibility
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      error: error.message,
      details: "Failed to generate code solution",
    });
  }
}

export const generateTests=async(req,res)=>{
  const openai= new OpenAI({
    apiKey: process.env.OPEN_AI_SECRET_KEY,
  })
  if (req.method !== "POST") {
  return res.status(405).json({ message: "Method not allowed" });
 }
 const {problem,constraint,code, 
  mainFunction,
  language,
  pythonMainFunction,
  title}=req.body;
 let recruiterQuestion=req.body.recruiterQuestion;

  if(!code){
    return res.status(404).json({message: "Code is required"});
  }
  const user=await User.findById(req.user?._id);
  if(!user){
    return ;
  }
  const messages = generateEnhancedPrompt(problem, constraint, code, language);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.2,
      max_tokens: 2500, // Reduced to prevent overly long responses
    });

    const raw = response.choices[0].message.content;
    console.log("📥 Raw OpenAI response length:", raw.length);
    console.log("📄 Raw response preview:", raw.substring(0, 500) + "...");

    const { ok, data, error } = parseTestCaseJSArray(raw);

    if (!ok) {
      console.error("❌ Failed to parse test cases:", error);
      return res
        .status(500)
        .json({ error: `Failed to parse test cases: ${error}` });
    }

    console.log(`✅ Generated ${data.length} test cases successfully`);

    const testCases = [];
    for (let tc of data) {
      try {
        testCases.push(expandTestCaseObject(tc));
      } catch (expandError) {
        console.warn("⚠️ Error expanding test case:", expandError, tc);
        // Skip problematic test cases instead of failing entirely
        continue;
      }
    }

    console.log(`📊 Final processed test cases count: ${testCases.length}`);

    if (testCases.length === 0) {
      return res.status(500).json({
        error: "No valid test cases generated",
        details: "All test cases failed to process",
      });
    }

    // WebSocket communication with enhanced error handling
    // Use Docker service name when running in container, otherwise use env var
    const websocketUrl =  'ws://127.0.0.1:8080' 
    console.log('🔌 Connecting to WebSocket:', websocketUrl);
    const ws = new WebSocket(websocketUrl);

    const result = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error("WebSocket timeout after 5 minutes"));
      }, 300000);

      ws.on("open", () => {
        console.log("WebSocket connected, sending test cases...");
        ws.send(
          JSON.stringify({
            editorCode: code,
            testCase: testCases,
            selectedLanguage: language,
            all: true,
            exampleTestCases: false,
          })
        );
      });

      ws.on("message", async (data) => {
        try {
          const result = JSON.parse(data);
          console.log("✅ WebSocket response received:", JSON.stringify(result).substring(0, 200));
          console.log("✅ result.data exists:", !!result.generatedResults);
          console.log("✅ result.data length:", result.generatedResults ? result.generatedResults.length : 0);

          if (!result.generatedResults || result.generatedResults.length === 0) {
            console.error("❌ No test case data in WebSocket response");
            clearTimeout(timeout);
            ws.close();
            resolve({
              status: "error",
              message: "No test case data received from execution",
            });
            return;
          }

        

          const problemData = {
            description: problem,
            testCase: result.generatedResults,
            constraints: constraint,
            difficulty: "medium",
            title: title || "Generated Problem",
            templateCode: mainFunction,
            pythonTemplateCode: pythonMainFunction,
          };

          let newProblem;
          recruiterQuestion=true; // For testing purposes, always save to main collection
          if (recruiterQuestion) {
            const newProb = new Problem(problemData);
            newProblem = await newProb.save();
            console.log("Problem added to main collection:", newProblem._id);
          } else {
            const newProb = new UserProblem(problemData);
            newProblem = await newProb.save();
            console.log("Problem added to user collection:", newProblem._id);
          }

          clearTimeout(timeout);
          ws.close();

          resolve({
            status: "success",
            message: `Generated ${testCases.length} test cases successfully`,
            url: `local:host:4000/problems/${
              newProblem._id
            }?RQP=${recruiterQuestion || ""}`,
            testCaseCount: testCases.length,
          });
        } catch (error) {
          console.error("❌ Error processing WebSocket message:", error);
          console.error("❌ Error stack:", error.stack);
          clearTimeout(timeout);
          ws.close();
          resolve({
            status: "error",
            message: `Error in saving problem: ${error.message}`,
          });
        }
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
        clearTimeout(timeout);
        ws.close();
        reject(new Error(`WebSocket error: ${error.message}`));
      });

      ws.on("close", (code, reason) => {
        console.log(`WebSocket closed: ${code} - ${reason}`);
        clearTimeout(timeout);
      });
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({
      error: error.message,
      message: "Failed to generate test cases",
    });
  }
}

/*
export const generateTests=async(req,res)=>{
    const openai= new OpenAI({
      apiKey: process.env.OPEN_AI_SECRET_KEY,
    })
    if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
   }
   const {problem,constraint,code, recruiterQuestion,
    mainFunction,
    language,
    pythonMainFunction,
    title}=req.body;

    if(!code){
      return res.status(404).json({message: "Code is required"});
    }
    const user=await User.findById(req.user?._id);
    if(!user){
      return ;
    }
    const messages=generateEnhancedPrompt(problem,constraint,code,language);

    try {
      const response=await openai.chat.completions.create({
         model: "gpt-4o",
      messages,
      temperature: 0.2,
      max_tokens: 2500, // Reduced to prevent overly long responses
       })
      
       console.log(response.choices[0].message);
       const raw=response.choices[0].message.content;
        console.log("📥 Raw OpenAI response length:", raw.length);
        console.log("📄 Raw response preview:", raw.substring(0,500)+"...");

       const {ok,data,error}= parseTestCaseJSArray(raw);
        if (!ok) {
      console.error("❌ Failed to parse test cases:", error);
      return res
        .status(500)
        .json({ error: `Failed to parse test cases: ${error}` });
    }
    console.log("data : ",data);

    const testCases=[];
    for(let tc of data){
     try{
      testCases.push(expandTestCaseObject(tc));
     } 
     catch(expandError){
      console.warn("⚠️ Error expanding test case:", expandError, tc);
      // Skip problematic test cases instead of failing entirely
      continue;
     }
    }
    const websocketUrl =  'wss://api.elitecode-ai.club' 
   
    console.log('🔌 Connecting to WebSocket:', websocketUrl);
    const ws = new WebSocket(websocketUrl);

    const runTests= await new Promise((resolve,reject)=>{

    const timeout=setTimeout(() => {
         try {
           ws.close();
           reject(new Error("Timeout waiting for worker response"));
         } catch (error) {
           console.log(error);
         }
       }, 300000);
    

     ws.on("open",()=>{
      console.log("websocket connected, sending testcases");
      const msg={
        editorCode: code,
        testCase: testCases,
        selectedLanguage: language,
        all:true,
        exampleTestCases: false,
      }
      ws.send(JSON.stringify(msg));
     })
      ws.on("message", async (data) => {
        try {
          const result = JSON.parse(data);
          console.log("✅ WebSocket response received:", JSON.stringify(result).substring(0, 200));
          //console.log("✅ result.data exists:", !!result.data);
          console.log("✅ result.data length:", result.generatedResults ? result.generatedResults.length : 0);

          // if (!result.data || result.data.length === 0) {
          //   console.error("❌ No test case data in WebSocket response");
          //   clearTimeout(timeout);
          //   ws.close();
          //   resolve({
          //     status: "error",
          //     message: "No test case data received from execution",
          //   });
          //   return;
          // }


          const problemData = {
            description: problem,
            testCase: result.generatedResults,
            constraints: constraint,
            difficulty: "medium",
            title: title || "Generated Problem",
            templateCode: mainFunction,
            pythonTemplateCode: pythonMainFunction,
          };

          let newProblem;
          if (recruiterQuestion) {
            const newProb = new Problem(problemData);
            newProblem = await newProb.save();
            console.log("Problem added to main collection:", newProblem._id);
          } else {
            const newProb = new UserProblem(problemData);
            newProblem = await newProb.save();
            console.log("Problem added to user collection:", newProblem._id);
          }

          clearTimeout(timeout);
          ws.close();

          resolve({
            status: "success",
            message: `Generated ${testCases.length} test cases successfully`,
            url: `localhost:4000/problems/${
              newProblem._id
            }?RQP=${recruiterQuestion || ""}`,
            testCaseCount: testCases.length,
          });
        } catch (error) {
          console.error("❌ Error processing WebSocket message:", error);
          console.error("❌ Error stack:", error.stack);
          clearTimeout(timeout);
          ws.close();
          resolve({
            status: "error",
            message: `Error in saving problem: ${error.message}`,
          });
        }
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
        clearTimeout(timeout);
        ws.close();
        reject(new Error(`WebSocket error: ${error.message}`));
      });

      ws.on("close", (code, reason) => {
        console.log(`WebSocket closed: ${code} - ${reason}`);
        clearTimeout(timeout);
      });
    

    res.status(200).json(runTests);

    })
    } catch (error) {
      console.log("error",error);
      res.status(500).json({error:"Internal Server error"});
    }
}*/