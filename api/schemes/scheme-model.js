/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

const db = require("../../data/db-config");

async function find() { // Egzersiz A
  /*
    1A- Aşağıdaki SQL sorgusunu SQLite Studio'da "data/schemes.db3" ile karşılaştırarak inceleyin.
    LEFT joini Inner joine çevirirsek ne olur?

      SELECT
          sc.*,
          count(st.step_id) as number_of_steps
      FROM schemes as sc
      LEFT JOIN steps as st
          ON sc.scheme_id = st.scheme_id
      GROUP BY sc.scheme_id
      ORDER BY sc.scheme_id ASC;

    2A- Sorguyu kavradığınızda devam edin ve onu Knex'te oluşturun.
    Bu işlevden elde edilen veri kümesini döndürün.
  */
const datas = await db("schemes as sc")
                    .leftJoin("steps as st", "sc.scheme_id", "st.scheme_id")
                    .select("sc.*")
                    .count("st.step_id as number_of_steps")
                    .groupBy("sc.scheme_id")
                    .orderBy("sc.scheme_id", "asc");
return datas;

}

async function findById(scheme_id) { // Egzersiz B

  const data = await db("schemes as sc")
               .leftJoin("steps as st", "sc.scheme_id", "st.scheme_id")
               .select("sc.scheme_name", "st.*")
               .where("sc.scheme_id", scheme_id)
               .orderBy("st.step_number", "asc");
  /*
    1B- Aşağıdaki SQL sorgusunu SQLite Studio'da "data/schemes.db3" ile karşılaştırarak inceleyin:

      SELECT
          sc.scheme_name,
          st.*
      FROM schemes as sc
      LEFT JOIN steps as st
          ON sc.scheme_id = st.scheme_id
      WHERE sc.scheme_id = 1
      ORDER BY st.step_number ASC;

    2B- Sorguyu kavradığınızda devam edin ve onu Knex'te oluşturun
    parametrik yapma: `1` hazır değeri yerine `scheme_id` kullanmalısınız.

    3B- Postman'da test edin ve ortaya çıkan verilerin bir şema gibi görünmediğini görün,
    ancak daha çok her biri şema bilgisi içeren bir step dizisi gibidir:

      [
        {
          "scheme_id": 1,
          "scheme_name": "World Domination",
          "step_id": 2,
          "step_number": 1,
          "instructions": "solve prime number theory"
        },
        {
          "scheme_id": 1,
          "scheme_name": "World Domination",
          "step_id": 1,
          "step_number": 2,
          "instructions": "crack cyber security"
        },
        // etc
      ]

    4B- Elde edilen diziyi ve vanilya JavaScript'i kullanarak, ile bir nesne oluşturun.
   Belirli bir "scheme_id" için adımların mevcut olduğu durum için aşağıdaki yapı:

      {
        "scheme_id": 1,
        "scheme_name": "World Domination",
        "steps": [
          {
            "step_id": 2,
            "step_number": 1,
            "instructions": "solve prime number theory"
          },
          {
            "step_id": 1,
            "step_number": 2,
            "instructions": "crack cyber security"
          },
          // etc
        ]
      }

    5B- Bir "scheme_id" için adım yoksa, sonuç şöyle görünmelidir:

      {
        "scheme_id": 7,
        "scheme_name": "Have Fun!",
        "steps": []
      }
  */

      if(data.length == 0) {
        return null;
      }

      let dataInfo = {
        scheme_id: Number(scheme_id),
        scheme_name:data[0].scheme_name,
        steps:[]
      }

      if(!data[0].step_id)
      return dataInfo;

      data.forEach(element => {
        let stepInfo = {
          step_id: element.step_id,
          step_number:element.step_number,
          instructions: element.instructions
        }
        dataInfo.steps.push(stepInfo)
      });
      return dataInfo;
}

function findSteps(scheme_id) { // Egzersiz C
 
 const steps = db("steps as st")
               .leftJoin("schemes as sc", "st.scheme_id", "sc.scheme_id")
               .select("st.step_id", "st.step_number", "st.instructions", "sc.scheme_name")
               .where("sc.scheme_id", scheme_id)
               .orderBy("st.step_number", "asc");
  return steps;

  /*
    1C- Knex'te aşağıdaki verileri döndüren bir sorgu oluşturun.
    Adımlar, adım_numarası'na göre sıralanmalıdır ve dizi
    Şema için herhangi bir adım yoksa boş olmalıdır:

      [
        {
          "step_id": 5,
          "step_number": 1,
          "instructions": "collect all the sheep in Scotland",
          "scheme_name": "Get Rich Quick"
        },
        {
          "step_id": 4,
          "step_number": 2,
          "instructions": "profit",
          "scheme_name": "Get Rich Quick"
        }
      ]
  */
}

async function add(scheme) {   // Egzersiz D
  
  let [scheme_id] = await db("schemes").insert(scheme);
  return findById(scheme_id);

  /*
    1D- Bu işlev yeni bir şema oluşturur ve _yeni oluşturulan şemaya çözümlenir.
  */
}

async function addStep(scheme_id, step) { // EXERCISE E

  step.scheme_id = scheme_id;
  await db("steps").insert(step);
  return findSteps(scheme_id);
  /*
    1E- Bu işlev, verilen 'scheme_id' ile şemaya bir adım ekler.
    ve verilen "scheme_id"ye ait _tüm adımları_ çözer,
    yeni oluşturulan dahil.
  */
}

module.exports = {
  find,
  findById,
  findSteps,
  add,
  addStep,
}
